import { UserOnTenantRepoPrisma } from "@/lib/repo/impl/UserOnTenantRepoPrisma";

import { createTestMembership, createTestTenantWithSettings, createTestUser } from "../helpers";

const repo = new UserOnTenantRepoPrisma();

describe("UserOnTenantRepoPrisma", () => {
  describe("create", () => {
    it("creates a membership with default role USER", async () => {
      const user = await createTestUser();
      const { tenant } = await createTestTenantWithSettings();

      const membership = await repo.create({ userId: user.id, tenantId: tenant.id });

      expect(membership.userId).toBe(user.id);
      expect(membership.tenantId).toBe(tenant.id);
      expect(membership.role).toBe("USER");
      expect(membership.status).toBe("ACTIVE");
    });
  });

  describe("findMembership", () => {
    it("finds membership by composite key", async () => {
      const user = await createTestUser();
      const { tenant } = await createTestTenantWithSettings();
      await createTestMembership(user.id, tenant.id, { role: "ADMIN" });

      const found = await repo.findMembership(user.id, tenant.id);

      expect(found).not.toBeNull();
      expect(found!.role).toBe("ADMIN");
    });

    it("returns null when membership does not exist", async () => {
      const user = await createTestUser();

      const found = await repo.findMembership(user.id, 999999);

      expect(found).toBeNull();
    });
  });

  describe("countOwners", () => {
    it("counts only ACTIVE OWNER members", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const owner1 = await createTestUser();
      const owner2 = await createTestUser();
      const blockedOwner = await createTestUser();
      const admin = await createTestUser();

      await createTestMembership(owner1.id, tenant.id, { role: "OWNER" });
      await createTestMembership(owner2.id, tenant.id, { role: "OWNER" });
      await createTestMembership(blockedOwner.id, tenant.id, { role: "OWNER", status: "BLOCKED" });
      await createTestMembership(admin.id, tenant.id, { role: "ADMIN" });

      const count = await repo.countOwners(tenant.id);

      expect(count).toBe(2);
    });
  });

  describe("findByUserId", () => {
    it("returns memberships with tenant included", async () => {
      const user = await createTestUser();
      const { tenant: t1 } = await createTestTenantWithSettings();
      const { tenant: t2 } = await createTestTenantWithSettings();
      await createTestMembership(user.id, t1.id);
      await createTestMembership(user.id, t2.id);

      const memberships = await repo.findByUserId(user.id);

      expect(memberships).toHaveLength(2);
      expect(memberships[0].tenant).toBeDefined();
    });
  });

  describe("findByUserIdWithSettings", () => {
    it("returns only ACTIVE memberships with non-null settings", async () => {
      const user = await createTestUser();
      const { tenant: t1 } = await createTestTenantWithSettings();
      const { tenant: t2 } = await createTestTenantWithSettings();
      // Tenant without settings
      const { prisma } = await import("@/lib/db/prisma");
      const plainTenant = await prisma.tenant.create({ data: {} });

      await createTestMembership(user.id, t1.id);
      await createTestMembership(user.id, t2.id, { status: "BLOCKED" });
      await createTestMembership(user.id, plainTenant.id);

      const results = await repo.findByUserIdWithSettings(user.id);

      // Only t1 should be returned (ACTIVE + has settings)
      expect(results).toHaveLength(1);
      expect(results[0].tenant.id).toBe(t1.id);
      expect(results[0].tenant.settings).not.toBeNull();
    });
  });

  describe("findByTenantId", () => {
    it("returns members with user included", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      await createTestMembership(user1.id, tenant.id);
      await createTestMembership(user2.id, tenant.id);

      const members = await repo.findByTenantId(tenant.id);

      expect(members).toHaveLength(2);
      expect(members[0].user).toBeDefined();
      expect(members[0].user.email).toBeDefined();
    });
  });

  describe("update", () => {
    it("updates membership role by composite key", async () => {
      const user = await createTestUser();
      const { tenant } = await createTestTenantWithSettings();
      await createTestMembership(user.id, tenant.id, { role: "USER" });

      const updated = await repo.update(user.id, tenant.id, { role: "ADMIN" });

      expect(updated.role).toBe("ADMIN");
    });
  });

  describe("delete", () => {
    it("deletes membership by composite key", async () => {
      const user = await createTestUser();
      const { tenant } = await createTestTenantWithSettings();
      await createTestMembership(user.id, tenant.id);

      await repo.delete(user.id, tenant.id);

      const found = await repo.findMembership(user.id, tenant.id);
      expect(found).toBeNull();
    });
  });
});
