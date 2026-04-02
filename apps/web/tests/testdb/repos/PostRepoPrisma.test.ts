import { PostRepoPrisma } from "@/lib/repo/impl/PostRepoPrisma";

import { createTestBoard, createTestPost, createTestTenantWithSettings, createTestUser } from "../helpers";

const repo = new PostRepoPrisma();

describe("PostRepoPrisma", () => {
  async function setupTenantAndBoard() {
    const user = await createTestUser();
    const { tenant } = await createTestTenantWithSettings();
    const board = await createTestBoard(tenant.id);
    return { user, tenant, board };
  }

  describe("create", () => {
    it("creates a post with all FK relations", async () => {
      const { user, tenant, board } = await setupTenantAndBoard();

      const post = await repo.create({
        title: "Test Post",
        boardId: board.id,
        tenantId: tenant.id,
        userId: user.id,
        slug: "test-post",
      });

      expect(post.id).toBeGreaterThan(0);
      expect(post.title).toBe("Test Post");
      expect(post.boardId).toBe(board.id);
      expect(post.tenantId).toBe(tenant.id);
      expect(post.userId).toBe(user.id);
      expect(post.approvalStatus).toBe("APPROVED");
    });

    it("creates an anonymous post without userId", async () => {
      const { tenant, board } = await setupTenantAndBoard();

      const post = await repo.create({
        title: "Anonymous Post",
        boardId: board.id,
        tenantId: tenant.id,
        anonymousId: "anon-123",
        slug: "anon-post",
      });

      expect(post.userId).toBeNull();
      expect(post.anonymousId).toBe("anon-123");
    });
  });

  describe("findById", () => {
    it("returns post when found", async () => {
      const { user, tenant, board } = await setupTenantAndBoard();
      const post = await createTestPost(board.id, tenant.id, user.id);

      const found = await repo.findById(post.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(post.id);
    });

    it("returns null when not found", async () => {
      const found = await repo.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe("findByBoardId", () => {
    it("returns posts with comment/follow/like counts", async () => {
      const { user, tenant, board } = await setupTenantAndBoard();
      await createTestPost(board.id, tenant.id, user.id);
      await createTestPost(board.id, tenant.id, user.id);

      const posts = await repo.findByBoardId(board.id);

      expect(posts).toHaveLength(2);
      // findByBoardId includes _count via Prisma include, but the return type is Post[]
      const postWithCount = posts[0] as (typeof posts)[0] & {
        _count: { comments: number; follows: number; likes: number };
      };
      expect(postWithCount._count).toBeDefined();
      expect(postWithCount._count.comments).toBe(0);
      expect(postWithCount._count.follows).toBe(0);
      expect(postWithCount._count.likes).toBe(0);
    });
  });

  describe("update", () => {
    it("updates only specified fields", async () => {
      const { user, tenant, board } = await setupTenantAndBoard();
      const post = await createTestPost(board.id, tenant.id, user.id, { title: "Original" });

      const updated = await repo.update(post.id, { title: "Modified" });

      expect(updated.title).toBe("Modified");
      expect(updated.description).toBe(post.description);
    });

    it("sets editedAt timestamp", async () => {
      const { user, tenant, board } = await setupTenantAndBoard();
      const post = await createTestPost(board.id, tenant.id, user.id);
      const editTime = new Date();

      const updated = await repo.update(post.id, { editedAt: editTime });

      expect(updated.editedAt).toEqual(editTime);
    });
  });

  describe("delete", () => {
    it("deletes a post", async () => {
      const { user, tenant, board } = await setupTenantAndBoard();
      const post = await createTestPost(board.id, tenant.id, user.id);

      await repo.delete(post.id);

      const found = await repo.findById(post.id);
      expect(found).toBeNull();
    });
  });
});
