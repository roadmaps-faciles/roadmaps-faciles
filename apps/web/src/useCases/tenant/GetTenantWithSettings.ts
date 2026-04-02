import { z } from "zod";

import { Tenant } from "@/lib/model/Tenant";
import { TenantSettings } from "@/lib/model/TenantSettings";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";

import { type UseCase } from "../types";

export const GetTenantWithSettingsInput = z.object({
  id: z.number(),
});
export type GetTenantWithSettingsInput = z.infer<typeof GetTenantWithSettingsInput>;

export const GetTenantWithSettingsOutput = z.object({
  tenant: Tenant,
  tenantSettings: TenantSettings,
});
export type GetTenantWithSettingsOutput = z.infer<typeof GetTenantWithSettingsOutput>;

export class GetTenantWithSettings implements UseCase<GetTenantWithSettingsInput, GetTenantWithSettingsOutput> {
  constructor(private readonly tenantRepo: ITenantRepo) {}

  public async execute(input: GetTenantWithSettingsInput): Promise<GetTenantWithSettingsOutput> {
    const tenant = await this.tenantRepo.findByIdWithSettings(input.id);
    if (!tenant?.settings) {
      throw new Error(`Tenant ${input.id} or associated settings not found`);
    }

    return {
      tenant: Tenant.parse(tenant),
      tenantSettings: TenantSettings.parse(tenant.settings),
    };
  }
}
