import { BoardRepoPrisma } from "@/lib/repo/impl/BoardRepoPrisma";

import { createTestBoard, createTestTenantWithSettings } from "../helpers";

const repo = new BoardRepoPrisma();

describe("BoardRepoPrisma", () => {
  describe("create", () => {
    it("creates a board", async () => {
      const { tenant } = await createTestTenantWithSettings();

      const board = await repo.create({
        name: "Feature Requests",
        order: 0,
        tenantId: tenant.id,
        slug: "feature-requests",
      });

      expect(board.id).toBeGreaterThan(0);
      expect(board.name).toBe("Feature Requests");
      expect(board.order).toBe(0);
      expect(board.tenantId).toBe(tenant.id);
    });
  });

  describe("findById", () => {
    it("returns board when found", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const board = await createTestBoard(tenant.id);

      const found = await repo.findById(board.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(board.id);
    });

    it("returns null when not found", async () => {
      const found = await repo.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe("findAllForTenant", () => {
    it("returns boards ordered by order ASC", async () => {
      const { tenant } = await createTestTenantWithSettings();
      await createTestBoard(tenant.id, { name: "Third", order: 2 });
      await createTestBoard(tenant.id, { name: "First", order: 0 });
      await createTestBoard(tenant.id, { name: "Second", order: 1 });

      const boards = await repo.findAllForTenant(tenant.id);

      expect(boards).toHaveLength(3);
      expect(boards[0].name).toBe("First");
      expect(boards[1].name).toBe("Second");
      expect(boards[2].name).toBe("Third");
    });

    it("returns empty array for tenant with no boards", async () => {
      const { tenant } = await createTestTenantWithSettings();

      const boards = await repo.findAllForTenant(tenant.id);

      expect(boards).toHaveLength(0);
    });
  });

  describe("reorder", () => {
    it("updates order for multiple boards in a transaction", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const b1 = await createTestBoard(tenant.id, { name: "A", order: 0 });
      const b2 = await createTestBoard(tenant.id, { name: "B", order: 1 });
      const b3 = await createTestBoard(tenant.id, { name: "C", order: 2 });

      await repo.reorder([
        { id: b1.id, order: 2 },
        { id: b2.id, order: 0 },
        { id: b3.id, order: 1 },
      ]);

      const boards = await repo.findAllForTenant(tenant.id);
      expect(boards[0].name).toBe("B");
      expect(boards[1].name).toBe("C");
      expect(boards[2].name).toBe("A");
    });
  });

  describe("findSlugById", () => {
    it("returns slug when board exists", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const board = await createTestBoard(tenant.id, { slug: "my-board" });

      const slug = await repo.findSlugById(board.id);

      expect(slug).toBe("my-board");
    });

    it("returns null when board does not exist", async () => {
      const slug = await repo.findSlugById(999999);

      expect(slug).toBeNull();
    });

    it("returns null when slug is null", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const board = await createTestBoard(tenant.id, { slug: null });

      const slug = await repo.findSlugById(board.id);

      expect(slug).toBeNull();
    });
  });

  describe("update", () => {
    it("updates board fields", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const board = await createTestBoard(tenant.id, { description: null });

      const updated = await repo.update(board.id, { description: "New description" });

      expect(updated.description).toBe("New description");
    });
  });

  describe("delete", () => {
    it("deletes a board", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const board = await createTestBoard(tenant.id);

      await repo.delete(board.id);

      const found = await repo.findById(board.id);
      expect(found).toBeNull();
    });
  });
});
