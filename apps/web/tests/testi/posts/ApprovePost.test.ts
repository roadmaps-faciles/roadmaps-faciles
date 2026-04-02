import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { ApprovePost } from "@/useCases/posts/ApprovePost";

import { type createMockPostRepo as CreateMockPostRepo, fakePost, createMockPostRepo } from "../helpers";

describe("ApprovePost", () => {
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: ApprovePost;

  beforeEach(() => {
    mockPostRepo = createMockPostRepo();
    useCase = new ApprovePost(mockPostRepo);
  });

  it("approves a pending post", async () => {
    const post = fakePost({ id: 1, tenantId: 1, approvalStatus: POST_APPROVAL_STATUS.PENDING });
    mockPostRepo.findById.mockResolvedValue(post);
    mockPostRepo.update.mockResolvedValue({ ...post, approvalStatus: POST_APPROVAL_STATUS.APPROVED });

    await useCase.execute({ postId: 1, tenantId: 1 });

    expect(mockPostRepo.update).toHaveBeenCalledWith(1, {
      approvalStatus: POST_APPROVAL_STATUS.APPROVED,
    });
  });

  it("throws when post is not found", async () => {
    mockPostRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ postId: 999, tenantId: 1 })).rejects.toThrow("Post not found");
  });

  it("throws when post does not belong to the tenant", async () => {
    const post = fakePost({ id: 1, tenantId: 2, approvalStatus: POST_APPROVAL_STATUS.PENDING });
    mockPostRepo.findById.mockResolvedValue(post);

    await expect(useCase.execute({ postId: 1, tenantId: 1 })).rejects.toThrow("Post does not belong to this tenant");
  });

  it("throws when post is not in PENDING status", async () => {
    const post = fakePost({ id: 1, tenantId: 1, approvalStatus: POST_APPROVAL_STATUS.APPROVED });
    mockPostRepo.findById.mockResolvedValue(post);

    await expect(useCase.execute({ postId: 1, tenantId: 1 })).rejects.toThrow("Post is not pending approval");
  });
});
