import { z } from "zod";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { getDnsProvider } from "@/lib/ee/dns-provider";
import { getDomainProvider } from "@/lib/ee/domain-provider";
import { logger } from "@/lib/logger";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";
import { type TenantSettings } from "@/prisma/client";
import { isValidCustomDomain, sanitizeCustomDomain } from "@/utils/customDomain";
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
  constructor(private readonly tenantSettingsRepo: ITenantSettingsRepo) {}

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

    let nextCustomDomain: null | string | undefined;
    if (input.customDomain !== undefined) {
      if (existing.uiTheme === "Dsfr" && !input.customDomain?.endsWith(".gouv.fr")) {
        throw new Error(
          "Le thème DSFR requiert un domaine .gouv.fr : repassez en thème par défaut avant de retirer ou changer ce domaine.",
        );
      }
      if (input.customDomain) {
        const sanitized = sanitizeCustomDomain(input.customDomain);
        if (!isValidCustomDomain(sanitized, config.rootDomain)) {
          throw new Error(
            "Domaine personnalisé invalide : indiquez un nom de domaine complet (ex: feedback.exemple.com), différent du domaine de la plateforme.",
          );
        }
        const domainConflict = await prisma.tenantSettings.findFirst({
          where: { customDomain: sanitized, id: { not: input.settingsId } },
        });
        if (domainConflict) {
          throw new Error("Ce domaine personnalisé est déjà utilisé par un autre tenant.");
        }
        nextCustomDomain = sanitized;
        data.customDomain = sanitized;
      } else {
        nextCustomDomain = null;
        data.customDomain = null;
        // Retirer le custom domain doit desactiver la redirection canonique, sinon le flag reste actif
        // sans domaine cible (dormant cote redirect, mais reactive en silence si le meme domaine revient).
        data.forceCustomDomainRedirect = false;
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

    if (nextCustomDomain !== undefined && nextCustomDomain !== existing.customDomain) {
      if (existing.customDomain) await provider.removeDomain(existing.customDomain);
      if (nextCustomDomain) await provider.addDomain(nextCustomDomain, "custom");
    }

    return result;
  }
}
