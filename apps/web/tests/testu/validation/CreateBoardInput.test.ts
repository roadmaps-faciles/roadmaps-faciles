import { CreateBoardInput } from "@/useCases/boards/CreateBoard";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("CreateBoardInput schema", () => {
  const valid = { tenantId: 1, name: "My Board" };

  it("accepts valid data", () => {
    expectZodSuccess(CreateBoardInput, valid);
  });

  it("accepts optional description", () => {
    const data = expectZodSuccess(CreateBoardInput, { ...valid, description: "A description" });
    expect(data.description).toBe("A description");
  });

  it("sets description to undefined when not provided", () => {
    const data = expectZodSuccess(CreateBoardInput, valid);
    expect(data.description).toBeUndefined();
  });

  it("rejects empty name", () => {
    expectZodFailure(CreateBoardInput, { ...valid, name: "" });
  });

  it("rejects missing name", () => {
    expectZodFailure(CreateBoardInput, { tenantId: 1 });
  });

  it("rejects missing tenantId", () => {
    expectZodFailure(CreateBoardInput, { name: "Board" });
  });
});
