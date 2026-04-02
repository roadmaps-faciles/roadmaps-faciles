import { DEFAULT_POST_APPROVAL_STATUS, Post, POST_APPROVAL_STATUS, postApprovalStatusEnum } from "@/lib/model/Post";

describe("POST_APPROVAL_STATUS", () => {
  it("has the expected values", () => {
    expect(POST_APPROVAL_STATUS.APPROVED).toBe("APPROVED");
    expect(POST_APPROVAL_STATUS.PENDING).toBe("PENDING");
    expect(POST_APPROVAL_STATUS.REJECTED).toBe("REJECTED");
  });

  it("has APPROVED as default", () => {
    expect(DEFAULT_POST_APPROVAL_STATUS).toBe("APPROVED");
  });
});

describe("postApprovalStatusEnum", () => {
  it("accepts valid values", () => {
    expect(postApprovalStatusEnum.parse("APPROVED")).toBe("APPROVED");
    expect(postApprovalStatusEnum.parse("PENDING")).toBe("PENDING");
    expect(postApprovalStatusEnum.parse("REJECTED")).toBe("REJECTED");
  });

  it("defaults to APPROVED when undefined", () => {
    expect(postApprovalStatusEnum.parse(undefined)).toBe("APPROVED");
  });

  it("rejects invalid values", () => {
    expect(() => postApprovalStatusEnum.parse("INVALID")).toThrow();
  });
});

describe("Post schema", () => {
  const validPost = {
    id: 1,
    title: "Test Post",
    description: "A description",
    boardId: 1,
    postStatusId: null,
    tenantId: 1,
    userId: "user-123",
    anonymousId: null,
    slug: "test-post",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editedAt: null,
    editedById: null,
    approvalStatus: "APPROVED",
    tags: ["tag1", "tag2"],
  };

  it("validates a complete post", () => {
    const result = Post.parse(validPost);
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Post");
    expect(result.tags).toEqual(["tag1", "tag2"]);
  });

  it("accepts nullable fields as null", () => {
    const result = Post.parse({
      ...validPost,
      description: null,
      postStatusId: null,
      userId: null,
      slug: null,
    });
    expect(result.description).toBeNull();
    expect(result.userId).toBeNull();
  });

  it("defaults approvalStatus to APPROVED", () => {
    const { approvalStatus: _, ...postWithoutStatus } = validPost;
    const result = Post.parse(postWithoutStatus);
    expect(result.approvalStatus).toBe("APPROVED");
  });

  it("coerces date strings to Date objects", () => {
    const result = Post.parse(validPost);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("rejects missing required fields", () => {
    expect(() => Post.parse({ id: 1 })).toThrow();
  });

  it("rejects invalid types", () => {
    expect(() => Post.parse({ ...validPost, id: "not-a-number" })).toThrow();
  });
});
