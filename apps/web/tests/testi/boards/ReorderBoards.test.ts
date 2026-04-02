import { ReorderBoards } from "@/useCases/boards/ReorderBoards";

import { type createMockBoardRepo as CreateMockBoardRepo, createMockBoardRepo } from "../helpers";

describe("ReorderBoards", () => {
  let mockBoardRepo: ReturnType<typeof CreateMockBoardRepo>;
  let useCase: ReorderBoards;

  beforeEach(() => {
    mockBoardRepo = createMockBoardRepo();
    useCase = new ReorderBoards(mockBoardRepo);
  });

  it("reorders boards successfully", async () => {
    const items = [
      { id: 1, order: 0 },
      { id: 2, order: 1 },
      { id: 3, order: 2 },
    ];
    mockBoardRepo.reorder.mockResolvedValue(undefined);

    await useCase.execute({ items });

    expect(mockBoardRepo.reorder).toHaveBeenCalledWith(items);
  });

  it("handles empty items array", async () => {
    mockBoardRepo.reorder.mockResolvedValue(undefined);

    await useCase.execute({ items: [] });

    expect(mockBoardRepo.reorder).toHaveBeenCalledWith([]);
  });
});
