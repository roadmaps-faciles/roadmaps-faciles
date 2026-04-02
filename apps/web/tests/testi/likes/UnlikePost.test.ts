import { UnlikePost } from "@/useCases/likes/UnlikePost";

import { type createMockLikeRepo as CreateMockLikeRepo, createMockLikeRepo } from "../helpers";

describe("UnlikePost", () => {
  let mockLikeRepo: ReturnType<typeof CreateMockLikeRepo>;
  let useCase: UnlikePost;

  beforeEach(() => {
    mockLikeRepo = createMockLikeRepo();
    useCase = new UnlikePost(mockLikeRepo);
  });

  it("unlikes by authenticated user", async () => {
    mockLikeRepo.deleteByUserId.mockResolvedValue(undefined);

    await useCase.execute({ postId: 1, tenantId: 1, userId: "user-1" });

    expect(mockLikeRepo.deleteByUserId).toHaveBeenCalledWith("user-1", 1, 1);
  });

  it("unlikes by anonymous user", async () => {
    mockLikeRepo.deleteByAnonymousId.mockResolvedValue(undefined);

    await useCase.execute({ postId: 1, tenantId: 1, anonymousId: "anon-1" });

    expect(mockLikeRepo.deleteByAnonymousId).toHaveBeenCalledWith("anon-1", 1, 1);
  });
});
