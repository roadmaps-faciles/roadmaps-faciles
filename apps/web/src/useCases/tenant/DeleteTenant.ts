import { z } from "zod";

import { config } from "@/config";
import { getDnsProvider } from "@/lib/ee/dns-provider";
import { getDomainProvider } from "@/lib/ee/domain-provider";
import { logger } from "@/lib/logger";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { UserRole } from "@/prisma/enums";

import { type UseCase } from "../types";

export const DeleteTenantInput = z.object({
  tenantId: z.number(),
  userId: z.string(),
});

export type DeleteTenantInput = z.infer<typeof DeleteTenantInput>;
export type DeleteTenantOutput = void;

export class DeleteTenant implements UseCase<DeleteTenantInput, DeleteTenantOutput> {
  constructor(
    private readonly tenantRepo: ITenantRepo,
    private readonly userOnTenantRepo: IUserOnTenantRepo,
  ) {}

  public async execute(input: DeleteTenantInput): Promise<DeleteTenantOutput> {
    const tenant = await this.tenantRepo.findByIdWithSettings(input.tenantId);
    if (!tenant) {
      throw new Error("Tenant introuvable.");
    }

    const membership = await this.userOnTenantRepo.findMembership(input.userId, input.tenantId);
    if (!membership || membership.role !== UserRole.OWNER) {
      throw new Error("Seul un propriétaire peut supprimer le tenant.");
    }

    // Block deletion of the last active tenant — delete the org instead
    const activeTenantCount = await this.tenantRepo.countByOrganizationId(tenant.organizationId);
    if (activeTenantCount <= 1) {
      throw new Error("LAST_TENANT");
    }

    await this.tenantRepo.update(input.tenantId, { deletedAt: new Date() });

    if (tenant.settings) {
      const provider = getDomainProvider();
      await provider.removeDomain(`${tenant.settings.subdomain}.${config.rootDomain}`);
      if (tenant.settings.customDomain) {
        await provider.removeDomain(tenant.settings.customDomain);
      }

      try {
        const dnsProvider = getDnsProvider();
        await dnsProvider.removeRecord(tenant.settings.subdomain);
      } catch (error) {
        logger.warn({ err: error }, "DNS removal failed");
      }
    }
  }
}
