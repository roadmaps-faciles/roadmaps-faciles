import { UpdateBoard } from "@/useCases/boards/UpdateBoard";

import { type createMockBoardRepo as CreateMockBoardRepo, createMockBoardRepo, fakeBoard } from "../helpers";

describe("UpdateBoard", () => {
  let mockBoardRepo: ReturnType<typeof CreateMockBoardRepo>;
  let useCase: UpdateBoard;

  beforeEach(() => {
    mockBoardRepo = createMockBoardRepo();
    useCase = new UpdateBoard(mockBoardRepo);
  });

  it("updates a board successfully", async () => {
    const updated = fakeBoard({ id: 1, name: "Updated", description: null });
    mockBoardRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 1, name: "Updated" });

    expect(result).toEqual(updated);
    expect(mockBoardRepo.update).toHaveBeenCalledWith(1, { name: "Updated", description: null });
  });

  it("passes description when provided", async () => {
    const updated = fakeBoard({ id: 1, name: "Updated", description: "A desc" });
    mockBoardRepo.update.mockResolvedValue(updated);

    await useCase.execute({ id: 1, name: "Updated", description: "A desc" });

    expect(mockBoardRepo.update).toHaveBeenCalledWith(1, { name: "Updated", description: "A desc" });
  });

  it("sets description to null when not provided", async () => {
    mockBoardRepo.update.mockResolvedValue(fakeBoard());

    await useCase.execute({ id: 1, name: "Board" });

    expect(mockBoardRepo.update).toHaveBeenCalledWith(1, { name: "Board", description: null });
  });
});
