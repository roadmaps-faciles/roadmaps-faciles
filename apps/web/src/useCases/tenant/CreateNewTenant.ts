import { z } from "zod";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { getDnsProvider } from "@/lib/ee/dns-provider";
import { type DnsProvisionResult } from "@/lib/ee/dns-provider/IDnsProvider";
import { getDomainProvider } from "@/lib/ee/domain-provider";
import { canCreateTenant } from "@/lib/ee/entitlements";
import { logger } from "@/lib/logger";
import { type TenantWithSettings } from "@/lib/model/Tenant";
import { type IInvitationRepo } from "@/lib/repo/IInvitationRepo";
import { type IOrganizationRepo } from "@/lib/repo/IOrganizationRepo";
import { type IOrgMemberRepo } from "@/lib/repo/IOrgMemberRepo";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { type IUserRepo } from "@/lib/repo/IUserRepo";
import { OrgPlan, OrgRole, UserRole, UserStatus } from "@/prisma/enums";
import { SendInvitation } from "@/useCases/invitations/SendInvitation";
import { isReservedSubdomain } from "@/utils/reservedSubdomains";

import { type UseCase } from "../types";

export const CreateNewTenantInput = z.object({
  name: z.string().min(1),
  subdomain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  ownerEmails: z.array(z.string().email()),
});

export type CreateNewTenantInput = z.infer<typeof CreateNewTenantInput>;

interface CreateNewTenantExecuteInput extends CreateNewTenantInput {
  creatorId: string;
  organizationId?: number;
  organizationName?: string;
  organizationSlug?: string;
}

export interface FailedInvitation {
  email: string;
  reason: string;
}

export interface CreateNewTenantOutput {
  dns?: DnsProvisionResult;
  failedInvitations?: FailedInvitation[];
  organization: { id: number };
  tenant: TenantWithSettings;
}

export class CreateNewTenant implements UseCase<CreateNewTenantExecuteInput, CreateNewTenantOutput> {
  constructor(
    private readonly tenantRepo: ITenantRepo,
    private readonly tenantSettingsRepo: ITenantSettingsRepo,
    private readonly invitationRepo: IInvitationRepo,
    private readonly userOnTenantRepo: IUserOnTenantRepo,
    private readonly userRepo: IUserRepo,
    private readonly organizationRepo: IOrganizationRepo,
    private readonly orgMemberRepo: IOrgMemberRepo,
  ) {}

  public async execute(input: CreateNewTenantExecuteInput): Promise<CreateNewTenantOutput> {
    if (isReservedSubdomain(input.subdomain)) {
      throw new Error("Ce sous-domaine est réservé.");
    }

    let organizationId: number;

    let tenantId: number;

    if (input.organizationId) {
      // Attach to existing organization — atomic entitlement check + tenant creation
      // with row lock to prevent TOCTOU race on concurrent tenant creation
      const result = await prisma.$transaction(
        async tx => {
          // Lock the org row to serialize concurrent tenant creations
          await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${input.organizationId!} FOR UPDATE`;

          const org = await tx.organization.findUnique({ where: { id: input.organizationId! } });
          if (!org) throw new Error("Organization not found");

          const currentCount = await tx.tenant.count({ where: { organizationId: input.organizationId! } });
          const allowed = await canCreateTenant(input.organizationId!, currentCount, tx);
          if (!allowed) {
            throw new Error("TENANT_LIMIT_REACHED");
          }

          // Create tenant inside the same transaction to prevent race
          return tx.tenant.create({ data: { organizationId: input.organizationId! } });
        },
        { isolationLevel: "Serializable" },
      );

      organizationId = input.organizationId;
      tenantId = result.id;
    } else {
      // Create organization for standalone tenant
      const organization = await this.organizationRepo.create({
        name: input.organizationName || input.name,
        slug: input.organizationSlug || input.subdomain,
        plan: OrgPlan.BASE,
      });
      organizationId = organization.id;

      const newTenant = await this.tenantRepo.create({ organizationId });
      tenantId = newTenant.id;
    }

    const settings = await this.tenantSettingsRepo.create({
      tenantId: tenantId,
      name: input.name,
      subdomain: input.subdomain,
    });

    const provider = getDomainProvider();
    await provider.addDomain(`${input.subdomain}.${config.rootDomain}`, "subdomain");

    let dnsResult: DnsProvisionResult | undefined;
    try {
      const dnsProvider = getDnsProvider();
      dnsResult = await dnsProvider.addRecord(input.subdomain);
    } catch (error) {
      logger.warn({ err: error }, "DNS provisioning failed");
    }

    await this.userOnTenantRepo.create({
      userId: input.creatorId,
      tenantId: tenantId,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    });

    if (!input.organizationId) {
      // Create org membership for new standalone orgs
      await this.orgMemberRepo.create({
        organizationId,
        userId: input.creatorId,
        role: OrgRole.OWNER,
      });
    }

    const tenantUrl = `${config.host.split("//")[0]}//${input.subdomain}.${config.rootDomain}`;
    const sendInvitation = new SendInvitation(this.invitationRepo, this.userRepo, this.userOnTenantRepo);

    const failedInvitations: FailedInvitation[] = [];
    for (const email of input.ownerEmails) {
      try {
        await sendInvitation.execute({
          tenantId: tenantId,
          email,
          tenantUrl,
          role: UserRole.OWNER,
          locale: settings.locale,
        });
      } catch (error) {
        const reason = (error as Error).message;
        logger.warn({ err: error, email, tenantId: tenantId }, "Owner invitation skipped");
        failedInvitations.push({ email, reason });
      }
    }

    // Fetch the created tenant for the return value
    const createdTenant = await this.tenantRepo.findById(tenantId);
    if (!createdTenant) throw new Error("Tenant not found after creation");

    return {
      tenant: { ...createdTenant, settings },
      organization: { id: organizationId },
      dns: dnsResult,
      ...(failedInvitations.length > 0 && { failedInvitations }),
    };
  }
}
