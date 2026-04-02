import { prisma } from "@/lib/db/prisma";
import { type Prisma, type TenantSettings } from "@/prisma/client";

import { type ITenantSettingsRepo } from "../ITenantSettingsRepo";

export class TenantSettingsRepoPrisma implements ITenantSettingsRepo {
  public findAll(): Promise<TenantSettings[]> {
    return prisma.tenantSettings.findMany();
  }

  public findById(id: number): Promise<null | TenantSettings> {
    return prisma.tenantSettings.findUnique({ where: { id } });
  }

  public findByTenantId(tenantId: number): Promise<null | TenantSettings> {
    return prisma.tenantSettings.findFirst({ where: { tenantId } });
  }

  public create(data: Prisma.TenantSettingsUncheckedCreateInput): Promise<TenantSettings> {
    return prisma.tenantSettings.create({ data });
  }

  public update(id: number, data: Prisma.TenantSettingsUncheckedUpdateInput): Promise<TenantSettings> {
    return prisma.tenantSettings.update({ where: { id }, data });
  }
}
