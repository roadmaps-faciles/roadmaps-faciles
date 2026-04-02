import { DeleteComment } from "@/useCases/comments/DeleteComment";

import { type createMockCommentRepo as CreateMockCommentRepo, createMockCommentRepo } from "../helpers";

describe("DeleteComment", () => {
  let mockCommentRepo: ReturnType<typeof CreateMockCommentRepo>;
  let useCase: DeleteComment;

  beforeEach(() => {
    mockCommentRepo = createMockCommentRepo();
    useCase = new DeleteComment(mockCommentRepo);
  });

  it("deletes a comment successfully", async () => {
    mockCommentRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ commentId: 1 });

    expect(mockCommentRepo.delete).toHaveBeenCalledWith(1);
  });
});
