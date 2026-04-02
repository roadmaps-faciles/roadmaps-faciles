import { TenantRepoPrisma } from "@/lib/repo/impl/TenantRepoPrisma";

import { createTestMembership, createTestTenantWithSettings, createTestUser } from "../helpers";

const repo = new TenantRepoPrisma();

describe("TenantRepoPrisma", () => {
  describe("create", () => {
    it("creates a tenant with autoincrement id", async () => {
      const tenant = await repo.create({});

      expect(tenant.id).toBeGreaterThan(0);
      expect(tenant.deletedAt).toBeNull();
      expect(tenant.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("findById", () => {
    it("returns tenant when found", async () => {
      const created = await repo.create({});

      const found = await repo.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it("returns null when not found", async () => {
      const found = await repo.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe("findByIdWithSettings", () => {
    it("includes settings when present", async () => {
      const { tenant } = await createTestTenantWithSettings({ name: "Test Org" });

      const found = await repo.findByIdWithSettings(tenant.id);

      expect(found).not.toBeNull();
      expect(found!.settings).not.toBeNull();
      expect(found!.settings!.name).toBe("Test Org");
    });

    it("returns null settings when no settings exist", async () => {
      const tenant = await repo.create({});

      const found = await repo.findByIdWithSettings(tenant.id);

      expect(found).not.toBeNull();
      expect(found!.settings).toBeNull();
    });
  });

  describe("findBySubdomain", () => {
    it("finds tenant via TenantSettings subdomain", async () => {
      const { tenant } = await createTestTenantWithSettings({ subdomain: "unique-sub" });

      const found = await repo.findBySubdomain("unique-sub");

      expect(found).not.toBeNull();
      expect(found!.id).toBe(tenant.id);
    });

    it("returns null for unknown subdomain", async () => {
      const found = await repo.findBySubdomain("nonexistent");

      expect(found).toBeNull();
    });
  });

  describe("findByCustomDomain", () => {
    it("finds tenant via TenantSettings customDomain", async () => {
      const { tenant } = await createTestTenantWithSettings({ customDomain: "custom.example.com" });

      const found = await repo.findByCustomDomain("custom.example.com");

      expect(found).not.toBeNull();
      expect(found!.id).toBe(tenant.id);
    });

    it("returns null for unknown custom domain", async () => {
      const found = await repo.findByCustomDomain("unknown.example.com");

      expect(found).toBeNull();
    });
  });

  describe("findAllWithSettings", () => {
    it("includes settings, owner members, and member count", async () => {
      const user = await createTestUser();
      const { tenant } = await createTestTenantWithSettings({ name: "My Org" });
      await createTestMembership(user.id, tenant.id, { role: "OWNER" });

      const results = await repo.findAllWithSettings();
      const found = results.find(t => t.id === tenant.id);

      expect(found).toBeDefined();
      expect(found!.settings).toBeDefined();
      expect(found!.settings.name).toBe("My Org");
      expect(found!.members).toHaveLength(1);
      expect(found!.members[0].user.email).toBe(user.email);
      expect(found!._count.members).toBe(1);
    });

    it("excludes tenants without settings", async () => {
      await repo.create({});
      const { tenant } = await createTestTenantWithSettings();

      const results = await repo.findAllWithSettings();

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(tenant.id);
    });
  });

  describe("findAllForUser", () => {
    it("returns tenants for user via UserOnTenant", async () => {
      const user = await createTestUser();
      const { tenant: t1 } = await createTestTenantWithSettings();
      const { tenant: t2 } = await createTestTenantWithSettings();
      await createTestMembership(user.id, t1.id);
      await createTestMembership(user.id, t2.id);

      const tenants = await repo.findAllForUser(user.id);

      expect(tenants).toHaveLength(2);
      const ids = tenants.map(t => t.id).sort();
      expect(ids).toEqual([t1.id, t2.id].sort());
    });

    it("returns empty array when user has no tenants", async () => {
      const user = await createTestUser();

      const tenants = await repo.findAllForUser(user.id);

      expect(tenants).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("updates tenant deletedAt", async () => {
      const created = await repo.create({});
      const now = new Date();

      const updated = await repo.update(created.id, { deletedAt: now });

      expect(updated.deletedAt).toEqual(now);
    });

    it("returns updated tenant with settings when requested", async () => {
      const { tenant } = await createTestTenantWithSettings({ name: "Before" });

      const updated = await repo.update(tenant.id, {}, true);

      expect(updated.settings).not.toBeNull();
      expect(updated.settings!.name).toBe("Before");
    });
  });
});
