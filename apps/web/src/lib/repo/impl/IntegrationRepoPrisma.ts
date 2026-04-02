import { prisma } from "@/lib/db/prisma";
import { type Prisma, type TenantIntegration } from "@/prisma/client";

import { type IIntegrationRepo } from "../IIntegrationRepo";

export class IntegrationRepoPrisma implements IIntegrationRepo {
  public create(data: Prisma.TenantIntegrationUncheckedCreateInput): Promise<TenantIntegration> {
    return prisma.tenantIntegration.create({ data });
  }

  public findById(id: number): Promise<null | TenantIntegration> {
    return prisma.tenantIntegration.findUnique({ where: { id } });
  }

  public findAllForTenant(tenantId: number): Promise<TenantIntegration[]> {
    return prisma.tenantIntegration.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  public findDueForSync(): Promise<TenantIntegration[]> {
    return prisma.$queryRaw<TenantIntegration[]>`
      SELECT * FROM "TenantIntegration"
      WHERE "enabled" = true
        AND "syncIntervalMinutes" IS NOT NULL
        AND (
          "lastSyncAt" IS NULL
          OR "lastSyncAt" + ("syncIntervalMinutes" || ' minutes')::interval < NOW()
        )
      ORDER BY "lastSyncAt" ASC NULLS FIRST
    `;
  }

  public update(id: number, data: Prisma.TenantIntegrationUncheckedUpdateInput): Promise<TenantIntegration> {
    return prisma.tenantIntegration.update({ where: { id }, data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.tenantIntegration.delete({ where: { id } });
  }
}
