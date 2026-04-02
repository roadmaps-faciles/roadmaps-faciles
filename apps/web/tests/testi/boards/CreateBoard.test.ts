import { CreateBoard } from "@/useCases/boards/CreateBoard";

import { type createMockBoardRepo as CreateMockBoardRepo, fakeBoard, createMockBoardRepo } from "../helpers";

describe("CreateBoard", () => {
  let mockBoardRepo: ReturnType<typeof CreateMockBoardRepo>;
  let useCase: CreateBoard;

  beforeEach(() => {
    mockBoardRepo = createMockBoardRepo();
    useCase = new CreateBoard(mockBoardRepo);
  });

  it("creates a board with auto-incremented order", async () => {
    const existingBoards = [fakeBoard({ order: 0 }), fakeBoard({ order: 1 }), fakeBoard({ order: 2 })];
    mockBoardRepo.findAllForTenant.mockResolvedValue(existingBoards);

    const newBoard = fakeBoard({ name: "New Board", order: 3 });
    mockBoardRepo.create.mockResolvedValue(newBoard);

    const result = await useCase.execute({ tenantId: 1, name: "New Board" });

    expect(mockBoardRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 1,
        name: "New Board",
        order: 3,
      }),
    );
    expect(result).toBe(newBoard);
  });

  it("creates a board with order 0 when no boards exist", async () => {
    mockBoardRepo.findAllForTenant.mockResolvedValue([]);

    const newBoard = fakeBoard({ name: "First Board", order: 0 });
    mockBoardRepo.create.mockResolvedValue(newBoard);

    await useCase.execute({ tenantId: 1, name: "First Board" });

    expect(mockBoardRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 0,
      }),
    );
  });

  it("sets description to null when not provided", async () => {
    mockBoardRepo.findAllForTenant.mockResolvedValue([]);
    mockBoardRepo.create.mockResolvedValue(fakeBoard());

    await useCase.execute({ tenantId: 1, name: "Board" });

    expect(mockBoardRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
    );
  });

  it("passes description when provided", async () => {
    mockBoardRepo.findAllForTenant.mockResolvedValue([]);
    mockBoardRepo.create.mockResolvedValue(fakeBoard());

    await useCase.execute({ tenantId: 1, name: "Board", description: "A board" });

    expect(mockBoardRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "A board",
      }),
    );
  });
});
