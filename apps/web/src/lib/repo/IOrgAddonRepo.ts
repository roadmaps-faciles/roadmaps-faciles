import { type AddonType, type OrgAddon, type Prisma } from "@/prisma/client";

export interface IOrgAddonRepo {
  delete(id: number): Promise<void>;
  findByOrgAndAddon(organizationId: number, addon: AddonType): Promise<null | OrgAddon>;
  findByOrgId(organizationId: number): Promise<OrgAddon[]>;
  findByTenantId(tenantId: number): Promise<OrgAddon[]>;
  isActiveForTenant(organizationId: number, tenantId: null | number, addon: AddonType): Promise<boolean>;
  upsert(data: Prisma.OrgAddonUncheckedCreateInput): Promise<OrgAddon>;
}
