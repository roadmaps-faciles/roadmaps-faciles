import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { RejectPost } from "@/useCases/posts/RejectPost";

import { type createMockPostRepo as CreateMockPostRepo, createMockPostRepo, fakePost } from "../helpers";

describe("RejectPost", () => {
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: RejectPost;

  beforeEach(() => {
    mockPostRepo = createMockPostRepo();
    useCase = new RejectPost(mockPostRepo);
  });

  it("rejects a pending post successfully", async () => {
    const post = fakePost({ id: 1, tenantId: 1, approvalStatus: POST_APPROVAL_STATUS.PENDING });
    mockPostRepo.findById.mockResolvedValue(post);
    mockPostRepo.update.mockResolvedValue({});

    await useCase.execute({ postId: 1, tenantId: 1 });

    expect(mockPostRepo.update).toHaveBeenCalledWith(1, {
      approvalStatus: POST_APPROVAL_STATUS.REJECTED,
    });
  });

  it("throws when post is not found", async () => {
    mockPostRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ postId: 999, tenantId: 1 })).rejects.toThrow("Post not found");
  });

  it("throws when post does not belong to tenant", async () => {
    const post = fakePost({ id: 1, tenantId: 2, approvalStatus: POST_APPROVAL_STATUS.PENDING });
    mockPostRepo.findById.mockResolvedValue(post);

    await expect(useCase.execute({ postId: 1, tenantId: 1 })).rejects.toThrow("Post does not belong to this tenant");
  });

  it("throws when post is not pending", async () => {
    const post = fakePost({ id: 1, tenantId: 1, approvalStatus: POST_APPROVAL_STATUS.APPROVED });
    mockPostRepo.findById.mockResolvedValue(post);

    await expect(useCase.execute({ postId: 1, tenantId: 1 })).rejects.toThrow("Post is not pending approval");
  });
});
