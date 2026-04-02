import { z } from "zod";

import { type TenantSettings, uiThemeSchema } from "@/lib/model/TenantSettings";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";

import { type UseCase } from "../types";

export const SaveTenantWithSettingsInput = z.object({
  id: z.number(),
  isPrivate: z.boolean(),
  allowAnonymousFeedback: z.boolean(),
  allowPostEdits: z.boolean(),
  allowPostDeletion: z.boolean(),
  showRoadmapInHeader: z.boolean(),
  allowVoting: z.boolean(),
  allowComments: z.boolean(),
  allowAnonymousVoting: z.boolean(),
  requirePostApproval: z.boolean(),
  allowEmbedding: z.boolean(),
  uiTheme: uiThemeSchema.optional(),
});
export type SaveTenantWithSettingsInput = z.infer<typeof SaveTenantWithSettingsInput>;
export type SaveTenantWithSettingsOutput = TenantSettings;

export class SaveTenantWithSettings implements UseCase<SaveTenantWithSettingsInput, SaveTenantWithSettingsOutput> {
  constructor(private readonly tenantSettingsRepo: ITenantSettingsRepo) {}

  public async execute(tenantSettings: SaveTenantWithSettingsInput): Promise<SaveTenantWithSettingsOutput> {
    if (tenantSettings.uiTheme === "Dsfr") {
      const current = await this.tenantSettingsRepo.findById(tenantSettings.id);
      if (!current?.customDomain?.endsWith(".gouv.fr")) {
        throw new Error("DSFR theme requires a .gouv.fr custom domain");
      }
    }

    const updatedTenantSetting = await this.tenantSettingsRepo.update(tenantSettings.id, {
      isPrivate: tenantSettings.isPrivate,
      allowAnonymousFeedback: tenantSettings.allowAnonymousFeedback,
      allowPostEdits: tenantSettings.allowPostEdits,
      allowPostDeletion: tenantSettings.allowPostDeletion,
      showRoadmapInHeader: tenantSettings.showRoadmapInHeader,
      allowVoting: tenantSettings.allowVoting,
      allowComments: tenantSettings.allowComments,
      allowAnonymousVoting: tenantSettings.allowAnonymousVoting,
      requirePostApproval: tenantSettings.requirePostApproval,
      allowEmbedding: tenantSettings.allowEmbedding,
      ...(tenantSettings.uiTheme && { uiTheme: tenantSettings.uiTheme }),
    });

    return updatedTenantSetting;
  }
}
