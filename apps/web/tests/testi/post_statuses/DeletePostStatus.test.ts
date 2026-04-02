import { DeletePostStatus } from "@/useCases/post_statuses/DeletePostStatus";

import { type createMockPostStatusRepo as CreateMockPostStatusRepo, createMockPostStatusRepo } from "../helpers";

const mockPostCount = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    post: { count: (...args: unknown[]) => mockPostCount(...args) },
  },
}));

describe("DeletePostStatus", () => {
  let mockPostStatusRepo: ReturnType<typeof CreateMockPostStatusRepo>;
  let useCase: DeletePostStatus;

  beforeEach(() => {
    mockPostStatusRepo = createMockPostStatusRepo();
    useCase = new DeletePostStatus(mockPostStatusRepo);
    mockPostCount.mockReset();
  });

  it("deletes a post status with no linked posts", async () => {
    mockPostCount.mockResolvedValue(0);
    mockPostStatusRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 1 });

    expect(mockPostStatusRepo.delete).toHaveBeenCalledWith(1);
  });

  it("throws when posts use this status", async () => {
    mockPostCount.mockResolvedValue(3);

    await expect(useCase.execute({ id: 1 })).rejects.toThrow(
      "Impossible de supprimer un statut utilisé par des posts.",
    );
  });
});
