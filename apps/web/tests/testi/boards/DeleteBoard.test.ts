import { DeleteBoard } from "@/useCases/boards/DeleteBoard";

import {
  type createMockBoardRepo as CreateMockBoardRepo,
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  createMockBoardRepo,
  createMockTenantSettingsRepo,
  fakeBoard,
  fakeTenantSettings,
} from "../helpers";

const mockPostCount = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    post: { count: (...args: unknown[]) => mockPostCount(...args) },
  },
}));

describe("DeleteBoard", () => {
  let mockBoardRepo: ReturnType<typeof CreateMockBoardRepo>;
  let mockSettingsRepo: ReturnType<typeof CreateMockTenantSettingsRepo>;
  let useCase: DeleteBoard;

  beforeEach(() => {
    mockBoardRepo = createMockBoardRepo();
    mockSettingsRepo = createMockTenantSettingsRepo();
    useCase = new DeleteBoard(mockBoardRepo, mockSettingsRepo);
    mockPostCount.mockReset();
  });

  it("deletes an empty board successfully", async () => {
    mockBoardRepo.findById.mockResolvedValue(fakeBoard({ id: 1, tenantId: 1 }));
    mockPostCount.mockResolvedValue(0);
    mockSettingsRepo.findByTenantId.mockResolvedValue(fakeTenantSettings({ rootBoardId: 2 }));
    mockBoardRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 1 });

    expect(mockBoardRepo.delete).toHaveBeenCalledWith(1);
  });

  it("throws when board is not found", async () => {
    mockBoardRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999 })).rejects.toThrow("Board introuvable.");
  });

  it("throws when board has posts", async () => {
    mockBoardRepo.findById.mockResolvedValue(fakeBoard({ id: 1 }));
    mockPostCount.mockResolvedValue(5);

    await expect(useCase.execute({ id: 1 })).rejects.toThrow(
      "Impossible de supprimer un board qui contient des posts.",
    );
  });

  it("throws when board is the root board", async () => {
    mockBoardRepo.findById.mockResolvedValue(fakeBoard({ id: 1, tenantId: 1 }));
    mockPostCount.mockResolvedValue(0);
    mockSettingsRepo.findByTenantId.mockResolvedValue(fakeTenantSettings({ rootBoardId: 1 }));

    await expect(useCase.execute({ id: 1 })).rejects.toThrow(
      "Impossible de supprimer le board utilisé comme page principale (roadmap).",
    );
  });
});
