import { type AddonType, type OrgAddon, type Prisma } from "@/prisma/client";

export interface IOrgAddonRepo {
  delete(id: number): Promise<void>;
  /** Drop every override row for an org (self-host "reset filter": back to all-active by default). */
  deleteByOrgId(organizationId: number): Promise<void>;
  findByOrgAndAddon(organizationId: number, addon: AddonType): Promise<null | OrgAddon>;
  findByOrgId(organizationId: number): Promise<OrgAddon[]>;
  findByTenantId(tenantId: number): Promise<OrgAddon[]>;
  isActiveForTenant(organizationId: number, tenantId: null | number, addon: AddonType): Promise<boolean>;
  /** Self-host denylist: an explicit active:false row means the addon is turned off for this org/tenant. */
  isDisabledForTenant(organizationId: number, tenantId: null | number, addon: AddonType): Promise<boolean>;
  /** Addons matching the given active state for this org (global OR tenant-scoped), for batch resolution. */
  listOverridesForTenant(organizationId: number, tenantId: null | number, active: boolean): Promise<AddonType[]>;
  upsert(data: Prisma.OrgAddonUncheckedCreateInput): Promise<OrgAddon>;
}
