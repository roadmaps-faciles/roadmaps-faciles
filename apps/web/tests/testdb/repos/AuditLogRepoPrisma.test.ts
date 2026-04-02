import { prisma } from "@/lib/db/prisma";
import { AuditLogRepoPrisma } from "@/lib/repo/impl/AuditLogRepoPrisma";

import { createTestAuditLog, createTestTenantWithSettings, createTestUser } from "../helpers";

const repo = new AuditLogRepoPrisma();

describe("AuditLogRepoPrisma", () => {
  describe("create", () => {
    it("creates an audit log entry", async () => {
      const log = await repo.create({ action: "POST_CREATE" });

      expect(log.id).toBeGreaterThan(0);
      expect(log.action).toBe("POST_CREATE");
      expect(log.success).toBe(true);
      expect(log.createdAt).toBeInstanceOf(Date);
    });

    it("creates a log with all optional fields", async () => {
      const user = await createTestUser();
      const { tenant } = await createTestTenantWithSettings();

      const log = await repo.create({
        action: "MEMBER_ROLE_UPDATE",
        userId: user.id,
        tenantId: tenant.id,
        targetType: "UserOnTenant",
        targetId: user.id,
        metadata: { oldRole: "USER", newRole: "ADMIN" },
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });

      expect(log.userId).toBe(user.id);
      expect(log.tenantId).toBe(tenant.id);
      expect(log.metadata).toEqual({ oldRole: "USER", newRole: "ADMIN" });
    });
  });

  describe("findAll", () => {
    it("returns logs filtered by tenantId", async () => {
      const { tenant: t1 } = await createTestTenantWithSettings();
      const { tenant: t2 } = await createTestTenantWithSettings();
      await createTestAuditLog({ tenantId: t1.id });
      await createTestAuditLog({ tenantId: t1.id });
      await createTestAuditLog({ tenantId: t2.id });

      const logs = await repo.findAll({ tenantId: t1.id });

      expect(logs).toHaveLength(2);
    });

    it("returns logs filtered by action", async () => {
      await createTestAuditLog({ action: "POST_CREATE" });
      await createTestAuditLog({ action: "POST_DELETE" });
      await createTestAuditLog({ action: "POST_CREATE" });

      const logs = await repo.findAll({ action: "POST_CREATE" });

      expect(logs).toHaveLength(2);
    });

    it("returns logs filtered by date range", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const tomorrow = new Date(now.getTime() + 86400000);

      await createTestAuditLog();

      const logs = await repo.findAll({ dateFrom: yesterday, dateTo: tomorrow });
      expect(logs.length).toBeGreaterThanOrEqual(1);

      const emptyLogs = await repo.findAll({
        dateFrom: new Date("2020-01-01"),
        dateTo: new Date("2020-01-02"),
      });
      expect(emptyLogs).toHaveLength(0);
    });

    it("returns logs ordered by createdAt DESC", async () => {
      await createTestAuditLog({ action: "BOARD_CREATE", createdAt: new Date("2024-01-01") });
      await createTestAuditLog({ action: "BOARD_DELETE", createdAt: new Date("2024-01-02") });

      const logs = await repo.findAll({});

      expect(logs[0].action).toBe("BOARD_DELETE");
      expect(logs[1].action).toBe("BOARD_CREATE");
    });
  });

  describe("findAll hydrateLogs", () => {
    it("includes user info when userId is set", async () => {
      const user = await createTestUser({ name: "Test User", email: "hydrate@test.com" });
      await createTestAuditLog({ userId: user.id });

      const logs = await repo.findAll({});

      expect(logs[0].user).not.toBeNull();
      expect(logs[0].user!.name).toBe("Test User");
      expect(logs[0].user!.email).toBe("hydrate@test.com");
    });

    it("returns null user when userId is not set", async () => {
      await createTestAuditLog();

      const logs = await repo.findAll({});

      expect(logs[0].user).toBeNull();
    });

    it("returns null user when referenced user no longer exists", async () => {
      const user = await createTestUser();
      await createTestAuditLog({ userId: user.id });

      // Delete user — audit log has no FK, so it survives
      await prisma.user.delete({ where: { id: user.id } });

      const logs = await repo.findAll({});

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(user.id);
      expect(logs[0].user).toBeNull();
    });
  });

  describe("findPaginated", () => {
    it("returns paginated results with total count", async () => {
      for (let i = 0; i < 5; i++) {
        await createTestAuditLog();
      }

      const page1 = await repo.findPaginated({}, 1, 2);
      const page2 = await repo.findPaginated({}, 2, 2);
      const page3 = await repo.findPaginated({}, 3, 2);

      expect(page1.total).toBe(5);
      expect(page1.items).toHaveLength(2);
      expect(page2.items).toHaveLength(2);
      expect(page3.items).toHaveLength(1);
    });

    it("applies filters to paginated results", async () => {
      const { tenant } = await createTestTenantWithSettings();
      for (let i = 0; i < 3; i++) {
        await createTestAuditLog({ tenantId: tenant.id });
      }
      await createTestAuditLog({ tenantId: null });

      const result = await repo.findPaginated({ tenantId: tenant.id }, 1, 10);

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
    });
  });

  describe("getDistinctActions", () => {
    it("returns unique action names", async () => {
      await createTestAuditLog({ action: "POST_CREATE" });
      await createTestAuditLog({ action: "POST_CREATE" });
      await createTestAuditLog({ action: "BOARD_CREATE" });
      await createTestAuditLog({ action: "POST_DELETE" });

      const actions = await repo.getDistinctActions();

      expect(actions).toHaveLength(3);
      expect(actions).toContain("POST_CREATE");
      expect(actions).toContain("BOARD_CREATE");
      expect(actions).toContain("POST_DELETE");
    });

    it("filters by tenantId when provided", async () => {
      const { tenant } = await createTestTenantWithSettings();
      await createTestAuditLog({ action: "POST_CREATE", tenantId: tenant.id });
      await createTestAuditLog({ action: "BOARD_CREATE", tenantId: null });

      const actions = await repo.getDistinctActions(tenant.id);

      expect(actions).toHaveLength(1);
      expect(actions[0]).toBe("POST_CREATE");
    });

    it("returns actions sorted alphabetically", async () => {
      await createTestAuditLog({ action: "POST_DELETE" });
      await createTestAuditLog({ action: "BOARD_CREATE" });
      await createTestAuditLog({ action: "MEMBER_REMOVE" });

      const actions = await repo.getDistinctActions();

      expect(actions).toEqual(["BOARD_CREATE", "MEMBER_REMOVE", "POST_DELETE"]);
    });
  });
});
