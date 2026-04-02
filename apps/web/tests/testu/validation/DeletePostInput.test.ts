import { DeletePostInput } from "@/useCases/posts/DeletePost";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("DeletePostInput schema", () => {
  const valid = { postId: 1, tenantId: 1 };

  it("accepts valid data", () => {
    expectZodSuccess(DeletePostInput, valid);
  });

  it("rejects missing postId", () => {
    expectZodFailure(DeletePostInput, { tenantId: 1 });
  });

  it("rejects missing tenantId", () => {
    expectZodFailure(DeletePostInput, { postId: 1 });
  });

  it("rejects string tenantId", () => {
    expectZodFailure(DeletePostInput, { postId: 1, tenantId: "1" });
  });
});
