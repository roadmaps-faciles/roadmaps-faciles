import { UpdatePostContent } from "@/useCases/posts/UpdatePostContent";

import { type createMockPostRepo as CreateMockPostRepo, createMockPostRepo, fakePost } from "../helpers";

describe("UpdatePostContent", () => {
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: UpdatePostContent;

  beforeEach(() => {
    mockPostRepo = createMockPostRepo();
    useCase = new UpdatePostContent(mockPostRepo);
  });

  it("updates post content successfully", async () => {
    const existing = fakePost({ id: 1, tenantId: 1 });
    const updated = fakePost({ id: 1, tenantId: 1, title: "Updated", editedById: "user-1" });
    mockPostRepo.findById.mockResolvedValue(existing);
    mockPostRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({
      postId: 1,
      tenantId: 1,
      title: "Updated",
      editedById: "user-1",
    });

    expect(result).toBeDefined();
    expect(mockPostRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: "Updated",
        editedById: "user-1",
      }),
    );
  });

  it("sets editedAt on update", async () => {
    const existing = fakePost({ id: 1, tenantId: 1 });
    mockPostRepo.findById.mockResolvedValue(existing);
    mockPostRepo.update.mockResolvedValue(fakePost({ id: 1, editedAt: new Date() }));

    await useCase.execute({
      postId: 1,
      tenantId: 1,
      title: "Updated",
      editedById: "user-1",
    });

    expect(mockPostRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        editedAt: expect.any(Date),
        editedById: "user-1",
      }),
    );
  });

  it("sets description to null when not provided", async () => {
    const existing = fakePost({ id: 1, tenantId: 1 });
    mockPostRepo.findById.mockResolvedValue(existing);
    mockPostRepo.update.mockResolvedValue(fakePost({ id: 1 }));

    await useCase.execute({
      postId: 1,
      tenantId: 1,
      title: "Updated",
      editedById: "user-1",
    });

    expect(mockPostRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ description: null }));
  });

  it("passes tags when provided", async () => {
    const existing = fakePost({ id: 1, tenantId: 1 });
    mockPostRepo.findById.mockResolvedValue(existing);
    mockPostRepo.update.mockResolvedValue(fakePost({ id: 1, tags: ["bug"] }));

    await useCase.execute({
      postId: 1,
      tenantId: 1,
      title: "Updated",
      editedById: "user-1",
      tags: ["bug"],
    });

    expect(mockPostRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ tags: ["bug"] }));
  });

  it("throws when post is not found", async () => {
    mockPostRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ postId: 999, tenantId: 1, title: "X", editedById: "user-1" })).rejects.toThrow(
      "Post not found",
    );
  });

  it("throws when post does not belong to tenant", async () => {
    const existing = fakePost({ id: 1, tenantId: 2 });
    mockPostRepo.findById.mockResolvedValue(existing);

    await expect(useCase.execute({ postId: 1, tenantId: 1, title: "X", editedById: "user-1" })).rejects.toThrow(
      "Post does not belong to this tenant",
    );
  });
});
