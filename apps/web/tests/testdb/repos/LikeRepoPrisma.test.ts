import { prisma } from "@/lib/db/prisma";
import { LikeRepoPrisma } from "@/lib/repo/impl/LikeRepoPrisma";

import { createTestBoard, createTestPost, createTestTenantWithSettings, createTestUser } from "../helpers";

const repo = new LikeRepoPrisma();

describe("LikeRepoPrisma", () => {
  async function setupPostWithUser() {
    const user = await createTestUser();
    const { tenant } = await createTestTenantWithSettings();
    const board = await createTestBoard(tenant.id);
    const post = await createTestPost(board.id, tenant.id, user.id);
    return { user, tenant, board, post };
  }

  describe("create", () => {
    it("creates a like by authenticated user", async () => {
      const { user, tenant, post } = await setupPostWithUser();

      const like = await repo.create({
        userId: user.id,
        postId: post.id,
        tenantId: tenant.id,
      });

      expect(like.id).toBeGreaterThan(0);
      expect(like.userId).toBe(user.id);
      expect(like.postId).toBe(post.id);
      expect(like.anonymousId).toBeNull();
    });

    it("creates a like by anonymous user", async () => {
      const { tenant, post } = await setupPostWithUser();

      const like = await repo.create({
        anonymousId: "anon-xyz",
        postId: post.id,
        tenantId: tenant.id,
      });

      expect(like.anonymousId).toBe("anon-xyz");
      expect(like.userId).toBeNull();
    });
  });

  describe("findById", () => {
    it("returns like when found", async () => {
      const { user, tenant, post } = await setupPostWithUser();
      const like = await repo.create({ userId: user.id, postId: post.id, tenantId: tenant.id });

      const found = await repo.findById(like.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(like.id);
    });
  });

  describe("deleteByUserId", () => {
    it("deletes like using composite key userId_postId", async () => {
      const { user, tenant, post } = await setupPostWithUser();
      await repo.create({ userId: user.id, postId: post.id, tenantId: tenant.id });

      await repo.deleteByUserId(user.id, post.id);

      const all = await repo.findAll();
      expect(all).toHaveLength(0);
    });
  });

  describe("deleteByAnonymousId", () => {
    it("deletes like using composite key anonymousId_postId", async () => {
      const { tenant, post } = await setupPostWithUser();
      await repo.create({ anonymousId: "anon-del", postId: post.id, tenantId: tenant.id });

      await repo.deleteByAnonymousId("anon-del", post.id);

      const all = await repo.findAll();
      expect(all).toHaveLength(0);
    });
  });

  describe("uniqueness constraints", () => {
    it("prevents duplicate like by same user on same post", async () => {
      const { user, tenant, post } = await setupPostWithUser();
      await repo.create({ userId: user.id, postId: post.id, tenantId: tenant.id });

      await expect(repo.create({ userId: user.id, postId: post.id, tenantId: tenant.id })).rejects.toThrow();
    });

    it("prevents duplicate like by same anonymous user on same post", async () => {
      const { tenant, post } = await setupPostWithUser();
      await repo.create({ anonymousId: "anon-dup", postId: post.id, tenantId: tenant.id });

      await expect(repo.create({ anonymousId: "anon-dup", postId: post.id, tenantId: tenant.id })).rejects.toThrow();
    });

    it("allows different users to like same post", async () => {
      const { tenant, post } = await setupPostWithUser();
      const user2 = await createTestUser();
      const user3 = await createTestUser();

      await repo.create({ userId: user2.id, postId: post.id, tenantId: tenant.id });
      await repo.create({ userId: user3.id, postId: post.id, tenantId: tenant.id });

      const likes = await prisma.like.count({ where: { postId: post.id } });
      expect(likes).toBe(2);
    });
  });
});
