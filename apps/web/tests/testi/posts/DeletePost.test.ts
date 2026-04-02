import { DeletePost } from "@/useCases/posts/DeletePost";

import { type createMockPostRepo as CreateMockPostRepo, createMockPostRepo, fakePost } from "../helpers";

describe("DeletePost", () => {
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: DeletePost;

  beforeEach(() => {
    mockPostRepo = createMockPostRepo();
    useCase = new DeletePost(mockPostRepo);
  });

  it("deletes a post successfully", async () => {
    const post = fakePost({ id: 1, tenantId: 1 });
    mockPostRepo.findById.mockResolvedValue(post);
    mockPostRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ postId: 1, tenantId: 1 });

    expect(mockPostRepo.delete).toHaveBeenCalledWith(1);
  });

  it("throws when post is not found", async () => {
    mockPostRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ postId: 999, tenantId: 1 })).rejects.toThrow("Post not found");
  });

  it("throws when post does not belong to tenant", async () => {
    const post = fakePost({ id: 1, tenantId: 2 });
    mockPostRepo.findById.mockResolvedValue(post);

    await expect(useCase.execute({ postId: 1, tenantId: 1 })).rejects.toThrow("Post does not belong to this tenant");
  });
});
