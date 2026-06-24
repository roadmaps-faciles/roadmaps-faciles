import { z } from "zod";

import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";
import { type TenantSettings } from "@/prisma/client";

import { type UseCase } from "../types";

export const SetTenantForceCustomDomainRedirectInput = z.object({
  settingsId: z.number(),
  forceCustomDomainRedirect: z.boolean(),
});
export type SetTenantForceCustomDomainRedirectInput = z.infer<typeof SetTenantForceCustomDomainRedirectInput>;
export type SetTenantForceCustomDomainRedirectOutput = TenantSettings;

export class SetTenantForceCustomDomainRedirect implements UseCase<
  SetTenantForceCustomDomainRedirectInput,
  SetTenantForceCustomDomainRedirectOutput
> {
  constructor(private readonly tenantSettingsRepo: ITenantSettingsRepo) {}

  public async execute(
    input: SetTenantForceCustomDomainRedirectInput,
  ): Promise<SetTenantForceCustomDomainRedirectOutput> {
    const existing = await this.tenantSettingsRepo.findById(input.settingsId);
    if (!existing) {
      throw new Error("Configuration du tenant introuvable.");
    }

    if (input.forceCustomDomainRedirect && !existing.customDomain) {
      throw new Error("Un domaine personnalisé doit être configuré avant d'activer la redirection canonique.");
    }

    return this.tenantSettingsRepo.update(input.settingsId, {
      forceCustomDomainRedirect: input.forceCustomDomainRedirect,
    });
  }
}
