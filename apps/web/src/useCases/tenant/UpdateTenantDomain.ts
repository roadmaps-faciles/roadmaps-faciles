import { z } from "zod";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { getDnsProvider } from "@/lib/ee/dns-provider";
import { getDomainProvider } from "@/lib/ee/domain-provider";
import { isDomainProtectedBy } from "@/lib/ee/domain-verification";
import { logger } from "@/lib/logger";
import { type IOrgDomainRepo } from "@/lib/repo/IOrgDomainRepo";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";
import { type TenantSettings } from "@/prisma/client";
import { isReservedSubdomain } from "@/utils/reservedSubdomains";

import { type UseCase } from "../types";

export const UpdateTenantDomainInput = z.object({
  settingsId: z.number(),
  subdomain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Seuls les caractères minuscules, chiffres et tirets sont autorisés.")
    .optional(),
  customDomain: z.string().nullable().optional(),
});

export type UpdateTenantDomainInput = z.infer<typeof UpdateTenantDomainInput>;
export type UpdateTenantDomainOutput = TenantSettings;

export class UpdateTenantDomain implements UseCase<UpdateTenantDomainInput, UpdateTenantDomainOutput> {
  constructor(
    private readonly tenantSettingsRepo: ITenantSettingsRepo,
    private readonly orgDomainRepo: IOrgDomainRepo,
  ) {}

  public async execute(input: UpdateTenantDomainInput): Promise<UpdateTenantDomainOutput> {
    const existing = await this.tenantSettingsRepo.findById(input.settingsId);
    if (!existing) {
      throw new Error("Configuration du tenant introuvable.");
    }

    const data: Record<string, unknown> = {};

    if (input.subdomain !== undefined) {
      if (isReservedSubdomain(input.subdomain)) {
        throw new Error("Ce sous-domaine est réservé.");
      }

      // Vérifier l'unicité du subdomain
      const conflict = await prisma.tenantSettings.findFirst({
        where: { subdomain: input.subdomain, id: { not: input.settingsId } },
      });
      if (conflict) {
        throw new Error("Ce sous-domaine est déjà utilisé par un autre tenant.");
      }
      data.subdomain = input.subdomain;
    }

    if (input.customDomain !== undefined) {
      if (existing.uiTheme === "Dsfr" && !input.customDomain?.endsWith(".gouv.fr")) {
        throw new Error(
          "Le thème DSFR requiert un domaine .gouv.fr : repassez en thème par défaut avant de retirer ou changer ce domaine.",
        );
      }

      // Le gate de propriété ne s'applique qu'au changement effectif : un re-save du même domaine
      // (ex: on ne touche que le subdomain) ne doit pas re-valider la couverture, sinon les
      // customDomains grandfathered sans OrgDomain vérifié casseraient à la moindre édition.
      if (input.customDomain !== existing.customDomain) {
        if (input.customDomain) {
          const domainConflict = await prisma.tenantSettings.findFirst({
            where: { customDomain: input.customDomain, id: { not: input.settingsId } },
          });
          if (domainConflict) {
            throw new Error("Ce domaine personnalisé est déjà utilisé par un autre tenant.");
          }

          // Propriété : le customDomain doit être couvert par un OrgDomain vérifié de l'org.
          const tenant = await prisma.tenant.findUnique({
            where: { id: existing.tenantId },
            select: { organizationId: true },
          });
          if (!tenant) {
            throw new Error("Organisation du tenant introuvable.");
          }
          const orgDomains = await this.orgDomainRepo.findByOrgId(tenant.organizationId);
          const isCovered = orgDomains.some(
            d => d.verifiedAt !== null && isDomainProtectedBy(input.customDomain!, d.domain),
          );
          if (!isCovered) {
            throw new Error(
              "Ce domaine doit d'abord être vérifié au niveau de l'organisation : ajoutez et vérifiez ce domaine (ou son domaine parent) dans les domaines de l'organisation avant de l'utiliser ici.",
            );
          }

          data.customDomain = input.customDomain;
          data.customDomainVerifiedAt = new Date();
        } else {
          data.customDomain = null;
          data.customDomainVerifiedAt = null;
        }
      }
    }

    const result = await this.tenantSettingsRepo.update(input.settingsId, data);

    const provider = getDomainProvider();

    if (input.subdomain && input.subdomain !== existing.subdomain) {
      await provider.removeDomain(`${existing.subdomain}.${config.rootDomain}`);
      await provider.addDomain(`${input.subdomain}.${config.rootDomain}`, "subdomain");

      try {
        const dnsProvider = getDnsProvider();
        await dnsProvider.removeRecord(existing.subdomain);
        await dnsProvider.addRecord(input.subdomain);
      } catch (error) {
        logger.warn({ err: error }, "DNS update failed");
      }
    }

    if (input.customDomain !== undefined && input.customDomain !== existing.customDomain) {
      if (existing.customDomain) await provider.removeDomain(existing.customDomain);
      if (input.customDomain) await provider.addDomain(input.customDomain, "custom");
    }

    return result;
  }
}
