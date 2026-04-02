import { prisma } from "@/lib/db/prisma";
import { type Prisma, type TenantDefaultOAuth } from "@/prisma/client";

import { type ITenantDefaultOAuthRepo } from "../ITenantDefaultOAuthRepo";

export class TenantDefaultOAuthRepoPrisma implements ITenantDefaultOAuthRepo {
  public findAll(): Promise<TenantDefaultOAuth[]> {
    return prisma.tenantDefaultOAuth.findMany();
  }

  public findById(id: number): Promise<null | TenantDefaultOAuth> {
    return prisma.tenantDefaultOAuth.findUnique({ where: { id } });
  }

  public findByTenantId(tenantId: number): Promise<TenantDefaultOAuth[]> {
    return prisma.tenantDefaultOAuth.findMany({ where: { tenantId } });
  }

  public create(data: Prisma.TenantDefaultOAuthUncheckedCreateInput): Promise<TenantDefaultOAuth> {
    return prisma.tenantDefaultOAuth.create({ data });
  }

  public async deleteByTenantIdAndProvider(tenantId: number, provider: string): Promise<void> {
    await prisma.tenantDefaultOAuth.delete({
      where: { tenantId_provider: { tenantId, provider } },
    });
  }

  public upsertByTenantIdAndProvider(tenantId: number, provider: string): Promise<TenantDefaultOAuth> {
    return prisma.tenantDefaultOAuth.upsert({
      where: { tenantId_provider: { tenantId, provider } },
      create: { tenantId, provider },
      update: {},
    });
  }
}
