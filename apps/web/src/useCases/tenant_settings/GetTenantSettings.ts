import { z } from "zod";

import { TenantSettings } from "@/lib/model/TenantSettings";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";

import { type UseCase } from "../types";

export const GetTenantSettingsInput = z.object({
  tenantId: z.number(),
});
export type GetTenantSettingsInput = z.infer<typeof GetTenantSettingsInput>;

export const GetTenantSettingsOutput = TenantSettings;
export type GetTenantSettingsOutput = z.infer<typeof GetTenantSettingsOutput>;

export class GetTenantSettings implements UseCase<GetTenantSettingsInput, GetTenantSettingsOutput> {
  constructor(private readonly tenantSettingsRepo: ITenantSettingsRepo) {}

  public async execute(input: GetTenantSettingsInput): Promise<GetTenantSettingsOutput> {
    const tenantSettings = await this.tenantSettingsRepo.findByTenantId(input.tenantId);
    if (!tenantSettings) {
      throw new Error(`Tenant settings from associated tenant (${input.tenantId}) not found`);
    }

    return TenantSettings.parse(tenantSettings);
  }
}
