import { z } from "zod";

import { TenantWithSettings } from "@/lib/model/Tenant";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";
import { localeSchema } from "@/utils/zod-schema";

import { type UseCase } from "../types";

export const SaveTenantInput = z.object({
  id: z.number(),
  setting: z.object({
    name: z.string(),
    subdomain: z.string(),
    customDomain: z.string().nullable(),
    locale: localeSchema,
  }),
});
export type SaveTenantInput = z.infer<typeof SaveTenantInput>;
export type SaveTenantOutput = TenantWithSettings;

export class SaveTenant implements UseCase<SaveTenantInput, SaveTenantOutput> {
  constructor(private readonly tenantRepo: ITenantRepo) {}

  public async execute(tenant: SaveTenantInput): Promise<SaveTenantOutput> {
    const updatedTenantWithSetting = await this.tenantRepo.update(
      tenant.id,
      {
        settings: {
          update: {
            name: tenant.setting.name,
            subdomain: tenant.setting.subdomain,
            customDomain: tenant.setting.customDomain,
            locale: tenant.setting.locale,
          },
        },
      },
      true,
    );

    return TenantWithSettings.parse(updatedTenantWithSetting);
  }
}
