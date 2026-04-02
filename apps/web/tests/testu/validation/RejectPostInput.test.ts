import { RejectPostInput } from "@/useCases/posts/RejectPost";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("RejectPostInput schema", () => {
  const valid = { postId: 1, tenantId: 1 };

  it("accepts valid data", () => {
    expectZodSuccess(RejectPostInput, valid);
  });

  it("rejects missing postId", () => {
    expectZodFailure(RejectPostInput, { tenantId: 1 });
  });

  it("rejects missing tenantId", () => {
    expectZodFailure(RejectPostInput, { postId: 1 });
  });

  it("rejects string postId", () => {
    expectZodFailure(RejectPostInput, { postId: "1", tenantId: 1 });
  });
});
