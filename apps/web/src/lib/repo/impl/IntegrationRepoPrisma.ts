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

  public findByGitHubInstallationId(installationId: number): Promise<null | TenantIntegration> {
    return prisma.tenantIntegration.findFirst({
      where: {
        type: "GITHUB",
        enabled: true,
        // Un tenant soft-deleted ne doit plus recevoir de webhook entrant (mutation sur tenant supprimé).
        tenant: { deletedAt: null },
        config: { path: ["installationId"], equals: installationId },
      },
    });
  }

  public findDueForSync(): Promise<TenantIntegration[]> {
    // JOIN sur Tenant + deletedAt IS NULL : un tenant soft-deleted ne doit plus être synchronisé par le cron.
    return prisma.$queryRaw<TenantIntegration[]>`
      SELECT ti.* FROM "TenantIntegration" ti
      JOIN "Tenant" t ON t.id = ti."tenantId"
      WHERE ti."enabled" = true
        AND t."deletedAt" IS NULL
        AND ti."syncIntervalMinutes" IS NOT NULL
        AND (
          ti."lastSyncAt" IS NULL
          OR ti."lastSyncAt" + (ti."syncIntervalMinutes" || ' minutes')::interval < NOW()
        )
      ORDER BY ti."lastSyncAt" ASC NULLS FIRST
    `;
  }

  public update(id: number, data: Prisma.TenantIntegrationUncheckedUpdateInput): Promise<TenantIntegration> {
    return prisma.tenantIntegration.update({ where: { id }, data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.tenantIntegration.delete({ where: { id } });
  }
}
