import { AddCommentToPost } from "@/useCases/comments/AddCommentToPost";

import { type createMockCommentRepo as CreateMockCommentRepo, createMockCommentRepo, fakeComment } from "../helpers";

describe("AddCommentToPost", () => {
  let mockCommentRepo: ReturnType<typeof CreateMockCommentRepo>;
  let useCase: AddCommentToPost;

  beforeEach(() => {
    mockCommentRepo = createMockCommentRepo();
    useCase = new AddCommentToPost(mockCommentRepo);
  });

  it("adds a comment successfully", async () => {
    const comment = fakeComment({ postId: 1, userId: "user-1", tenantId: 1, body: "Great idea!" });
    mockCommentRepo.create.mockResolvedValue(comment);

    const result = await useCase.execute({
      postId: 1,
      userId: "user-1",
      tenantId: 1,
      body: "Great idea!",
    });

    expect(result).toBeDefined();
    expect(mockCommentRepo.create).toHaveBeenCalledWith({
      postId: 1,
      userId: "user-1",
      tenantId: 1,
      body: "Great idea!",
    });
  });
});
