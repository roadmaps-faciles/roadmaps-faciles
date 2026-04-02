import { prisma } from "@/lib/db/prisma";
import { AppSettingsRepoPrisma } from "@/lib/repo/impl/AppSettingsRepoPrisma";

import { createTestTenantWithSettings } from "../helpers";

const repo = new AppSettingsRepoPrisma();

describe("AppSettingsRepoPrisma", () => {
  describe("get", () => {
    it("creates singleton on first call with default values", async () => {
      const settings = await repo.get();

      expect(settings.id).toBe(0);
      expect(settings.force2FA).toBe(false);
      expect(settings.force2FAGraceDays).toBe(5);
      expect(settings.pinnedTenantId).toBeNull();
    });

    it("returns existing singleton on subsequent calls", async () => {
      await repo.get();
      const settings = await repo.get();

      expect(settings.id).toBe(0);
    });
  });

  describe("update — pinnedTenantId", () => {
    it("sets pinnedTenantId to a valid tenant", async () => {
      const { tenant } = await createTestTenantWithSettings();

      const updated = await repo.update({ pinnedTenantId: tenant.id });

      expect(updated.pinnedTenantId).toBe(tenant.id);
    });

    it("persists pinnedTenantId across get calls", async () => {
      const { tenant } = await createTestTenantWithSettings();
      await repo.update({ pinnedTenantId: tenant.id });

      const settings = await repo.get();

      expect(settings.pinnedTenantId).toBe(tenant.id);
    });

    it("unsets pinnedTenantId with null", async () => {
      const { tenant } = await createTestTenantWithSettings();
      await repo.update({ pinnedTenantId: tenant.id });

      const updated = await repo.update({ pinnedTenantId: null });

      expect(updated.pinnedTenantId).toBeNull();
    });

    it("switches pinned tenant to another tenant", async () => {
      const { tenant: tenant1 } = await createTestTenantWithSettings();
      const { tenant: tenant2 } = await createTestTenantWithSettings();
      await repo.update({ pinnedTenantId: tenant1.id });

      const updated = await repo.update({ pinnedTenantId: tenant2.id });

      expect(updated.pinnedTenantId).toBe(tenant2.id);
    });

    it("rejects pinnedTenantId referencing non-existent tenant", async () => {
      await expect(repo.update({ pinnedTenantId: 999999 })).rejects.toThrow();
    });

    it("does not affect other fields when updating pinnedTenantId", async () => {
      await repo.update({ force2FA: true, force2FAGraceDays: 3 });
      const { tenant } = await createTestTenantWithSettings();

      const updated = await repo.update({ pinnedTenantId: tenant.id });

      expect(updated.force2FA).toBe(true);
      expect(updated.force2FAGraceDays).toBe(3);
      expect(updated.pinnedTenantId).toBe(tenant.id);
    });

    it("sets pinnedTenantId to null when pinned tenant is deleted", async () => {
      const { tenant } = await createTestTenantWithSettings();
      await repo.update({ pinnedTenantId: tenant.id });

      // ON DELETE SET NULL — deleting the tenant should clear the FK
      await prisma.tenantSettings.deleteMany({ where: { tenantId: tenant.id } });
      await prisma.tenant.delete({ where: { id: tenant.id } });

      const settings = await repo.get();
      expect(settings.pinnedTenantId).toBeNull();
    });
  });
});
