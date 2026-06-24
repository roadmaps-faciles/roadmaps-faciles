import { z } from "zod";

import { verifyDomainTxt } from "@/lib/ee/domain-verification";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";
import { type TenantSettings } from "@/prisma/client";

import { type UseCase } from "../types";

export const VerifyTenantCustomDomainInput = z.object({
  settingsId: z.number(),
});

export type VerifyTenantCustomDomainInput = z.infer<typeof VerifyTenantCustomDomainInput>;
export interface VerifyTenantCustomDomainOutput {
  settings: TenantSettings;
  verified: boolean;
}

export class VerifyTenantCustomDomain implements UseCase<
  VerifyTenantCustomDomainInput,
  VerifyTenantCustomDomainOutput
> {
  constructor(private readonly tenantSettingsRepo: ITenantSettingsRepo) {}

  public async execute(input: VerifyTenantCustomDomainInput): Promise<VerifyTenantCustomDomainOutput> {
    const existing = await this.tenantSettingsRepo.findById(input.settingsId);
    if (!existing) {
      throw new Error("Configuration du tenant introuvable.");
    }
    if (!existing.customDomain || !existing.customDomainVerificationToken) {
      throw new Error("Aucun domaine personnalisé à vérifier.");
    }

    const verified = await verifyDomainTxt(existing.customDomain, existing.customDomainVerificationToken);
    if (!verified) {
      return { settings: existing, verified: false };
    }

    const settings = await this.tenantSettingsRepo.update(input.settingsId, { customDomainVerifiedAt: new Date() });
    return { settings, verified: true };
  }
}
