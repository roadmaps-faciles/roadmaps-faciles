import { prisma } from "@/lib/db/prisma";
import { IntegrationRepoPrisma } from "@/lib/repo/impl/IntegrationRepoPrisma";
import { type Prisma } from "@/prisma/client";

import { createTestTenant } from "../helpers";

const repo = new IntegrationRepoPrisma();

async function createTestIntegration(
  tenantId: number,
  overrides: Partial<Prisma.TenantIntegrationUncheckedCreateInput> = {},
) {
  const defaults: Prisma.TenantIntegrationUncheckedCreateInput = {
    tenantId,
    type: "GITHUB",
    name: "Test integration",
    config: { installationId: 12345 },
    enabled: true,
    syncIntervalMinutes: 60,
  };
  return prisma.tenantIntegration.create({ data: { ...defaults, ...overrides, tenantId } });
}

describe("IntegrationRepoPrisma", () => {
  describe("findByGitHubInstallationId", () => {
    it("finds an enabled GitHub integration by installation id", async () => {
      const tenant = await createTestTenant();
      const integration = await createTestIntegration(tenant.id, { config: { installationId: 999 } });

      const found = await repo.findByGitHubInstallationId(999);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(integration.id);
    });

    it("returns null when the tenant is soft-deleted", async () => {
      const tenant = await createTestTenant();
      await createTestIntegration(tenant.id, { config: { installationId: 888 } });
      await prisma.tenant.update({ where: { id: tenant.id }, data: { deletedAt: new Date() } });

      const found = await repo.findByGitHubInstallationId(888);

      expect(found).toBeNull();
    });
  });

  describe("findDueForSync", () => {
    it("returns enabled integrations that are due", async () => {
      const tenant = await createTestTenant();
      const integration = await createTestIntegration(tenant.id, { lastSyncAt: null });

      const due = await repo.findDueForSync();

      expect(due.map(i => i.id)).toContain(integration.id);
    });

    it("excludes integrations whose tenant is soft-deleted", async () => {
      const tenant = await createTestTenant();
      const integration = await createTestIntegration(tenant.id, { lastSyncAt: null });
      await prisma.tenant.update({ where: { id: tenant.id }, data: { deletedAt: new Date() } });

      const due = await repo.findDueForSync();

      expect(due.map(i => i.id)).not.toContain(integration.id);
    });
  });
});
