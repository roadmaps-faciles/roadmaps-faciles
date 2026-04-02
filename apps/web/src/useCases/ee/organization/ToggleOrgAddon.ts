import { z } from "zod";

import { addonTypeEnum } from "@/lib/model/Organization";
import { type IOrgAddonRepo } from "@/lib/repo/IOrgAddonRepo";
import { type OrgAddon } from "@/prisma/client";

import { type UseCase } from "../../types";

export const ToggleOrgAddonInput = z.object({
  organizationId: z.number(),
  tenantId: z.number().nullable(),
  addon: addonTypeEnum,
  active: z.boolean(),
});

export type ToggleOrgAddonInput = z.infer<typeof ToggleOrgAddonInput>;
export type ToggleOrgAddonOutput = OrgAddon;

/**
 * Pure DB operation — upserts an OrgAddon record.
 * Stripe billing sync is handled by the caller (server action).
 */
export class ToggleOrgAddon implements UseCase<ToggleOrgAddonInput, ToggleOrgAddonOutput> {
  constructor(private readonly orgAddonRepo: IOrgAddonRepo) {}

  public async execute(input: ToggleOrgAddonInput): Promise<ToggleOrgAddonOutput> {
    return this.orgAddonRepo.upsert({
      organizationId: input.organizationId,
      tenantId: input.tenantId,
      addon: input.addon,
      active: input.active,
    });
  }
}
