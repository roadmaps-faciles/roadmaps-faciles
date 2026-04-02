import { LikePost } from "@/useCases/likes/LikePost";

import { type createMockLikeRepo as CreateMockLikeRepo, createMockLikeRepo, fakeLike } from "../helpers";

describe("LikePost", () => {
  let mockLikeRepo: ReturnType<typeof CreateMockLikeRepo>;
  let useCase: LikePost;

  beforeEach(() => {
    mockLikeRepo = createMockLikeRepo();
    useCase = new LikePost(mockLikeRepo);
  });

  it("creates a like by authenticated user", async () => {
    const like = fakeLike({ postId: 1, userId: "user-1", tenantId: 1 });
    mockLikeRepo.create.mockResolvedValue(like);

    const result = await useCase.execute({ postId: 1, tenantId: 1, userId: "user-1" });

    expect(result).toBeDefined();
    expect(mockLikeRepo.create).toHaveBeenCalledWith({
      postId: 1,
      tenantId: 1,
      userId: "user-1",
    });
  });

  it("creates a like by anonymous user", async () => {
    const like = fakeLike({ postId: 1, anonymousId: "anon-1", userId: null, tenantId: 1 });
    mockLikeRepo.create.mockResolvedValue(like);

    const result = await useCase.execute({ postId: 1, tenantId: 1, anonymousId: "anon-1" });

    expect(result).toBeDefined();
    expect(mockLikeRepo.create).toHaveBeenCalledWith({
      postId: 1,
      tenantId: 1,
      anonymousId: "anon-1",
    });
  });
});
