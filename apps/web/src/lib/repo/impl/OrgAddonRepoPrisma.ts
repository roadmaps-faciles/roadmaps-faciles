import { prisma } from "@/lib/db/prisma";
import { type AddonType, type OrgAddon, type Prisma } from "@/prisma/client";

import { type IOrgAddonRepo } from "../IOrgAddonRepo";

export class OrgAddonRepoPrisma implements IOrgAddonRepo {
  public async delete(id: number): Promise<void> {
    await prisma.orgAddon.delete({ where: { id } });
  }

  public async deleteByOrgId(organizationId: number): Promise<void> {
    await prisma.orgAddon.deleteMany({ where: { organizationId } });
  }

  public findByOrgAndAddon(organizationId: number, addon: AddonType): Promise<null | OrgAddon> {
    return prisma.orgAddon.findFirst({ where: { organizationId, addon, tenantId: null } });
  }

  public findByOrgId(organizationId: number): Promise<OrgAddon[]> {
    return prisma.orgAddon.findMany({ where: { organizationId } });
  }

  public findByTenantId(tenantId: number): Promise<OrgAddon[]> {
    return prisma.orgAddon.findMany({ where: { tenantId } });
  }

  public async isActiveForTenant(organizationId: number, tenantId: null | number, addon: AddonType): Promise<boolean> {
    const result = await prisma.orgAddon.findFirst({
      where: {
        organizationId,
        addon,
        active: true,
        OR: tenantId !== null ? [{ tenantId: null }, { tenantId }] : [{ tenantId: null }],
      },
    });
    return result !== null;
  }

  public async isDisabledForTenant(
    organizationId: number,
    tenantId: null | number,
    addon: AddonType,
  ): Promise<boolean> {
    const result = await prisma.orgAddon.findFirst({
      where: {
        organizationId,
        addon,
        active: false,
        OR: tenantId !== null ? [{ tenantId: null }, { tenantId }] : [{ tenantId: null }],
      },
    });
    return result !== null;
  }

  public async upsert(data: Prisma.OrgAddonUncheckedCreateInput): Promise<OrgAddon> {
    // Prisma doesn't support upsert on composite unique with nullable fields.
    // Wrap in serializable transaction to prevent TOCTOU race on concurrent toggles.
    return prisma.$transaction(
      async tx => {
        const existing = await tx.orgAddon.findFirst({
          where: {
            organizationId: data.organizationId,
            tenantId: data.tenantId ?? null,
            addon: data.addon,
          },
        });

        if (existing) {
          return tx.orgAddon.update({
            where: { id: existing.id },
            data: { active: data.active },
          });
        }

        return tx.orgAddon.create({ data });
      },
      { isolationLevel: "Serializable" },
    );
  }
}
