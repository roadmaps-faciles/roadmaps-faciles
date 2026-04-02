import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { SubmitPost, type SubmitPostInput } from "@/useCases/posts/SubmitPost";

import { type createMockPostRepo as CreateMockPostRepo, fakePost, createMockPostRepo } from "../helpers";

describe("SubmitPost", () => {
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: SubmitPost;

  beforeEach(() => {
    mockPostRepo = createMockPostRepo();
    useCase = new SubmitPost(mockPostRepo);
  });

  it("creates a post with APPROVED status when approval is not required", async () => {
    const input: SubmitPostInput = {
      title: "My Post",
      description: "A description",
      boardId: 1,
      tenantId: 1,
      userId: "user-123",
      requirePostApproval: false,
    };

    const expectedPost = fakePost({ ...input, approvalStatus: POST_APPROVAL_STATUS.APPROVED });
    mockPostRepo.create.mockResolvedValue(expectedPost);

    const result = await useCase.execute(input);

    expect(mockPostRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalStatus: POST_APPROVAL_STATUS.APPROVED,
        title: "My Post",
      }),
    );
    expect(result).toBe(expectedPost);
  });

  it("creates a post with PENDING status when approval is required", async () => {
    const input: SubmitPostInput = {
      title: "My Post",
      boardId: 1,
      tenantId: 1,
      userId: "user-123",
      requirePostApproval: true,
    };

    const expectedPost = fakePost({ ...input, approvalStatus: POST_APPROVAL_STATUS.PENDING });
    mockPostRepo.create.mockResolvedValue(expectedPost);

    const result = await useCase.execute(input);

    expect(mockPostRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalStatus: POST_APPROVAL_STATUS.PENDING,
      }),
    );
    expect(result.approvalStatus).toBe(POST_APPROVAL_STATUS.PENDING);
  });

  it("creates an anonymous post with anonymousId", async () => {
    const input: SubmitPostInput = {
      title: "Anonymous Post",
      boardId: 1,
      tenantId: 1,
      anonymousId: "anon-456",
      requirePostApproval: false,
    };

    const expectedPost = fakePost({ ...input, userId: null });
    mockPostRepo.create.mockResolvedValue(expectedPost);

    await useCase.execute(input);

    expect(mockPostRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        anonymousId: "anon-456",
      }),
    );
  });

  it("creates an authenticated post with userId", async () => {
    const input: SubmitPostInput = {
      title: "Auth Post",
      boardId: 1,
      tenantId: 1,
      userId: "user-789",
      requirePostApproval: false,
    };

    const expectedPost = fakePost(input);
    mockPostRepo.create.mockResolvedValue(expectedPost);

    await useCase.execute(input);

    expect(mockPostRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-789",
        anonymousId: null,
      }),
    );
  });

  it("sets description to null when not provided", async () => {
    const input: SubmitPostInput = {
      title: "No Description",
      boardId: 1,
      tenantId: 1,
      userId: "user-123",
      requirePostApproval: false,
    };

    mockPostRepo.create.mockResolvedValue(fakePost(input));

    await useCase.execute(input);

    expect(mockPostRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
    );
  });
});
