import { ApprovePostInput } from "@/useCases/posts/ApprovePost";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("ApprovePostInput schema", () => {
  const valid = { postId: 1, tenantId: 1 };

  it("accepts valid data", () => {
    expectZodSuccess(ApprovePostInput, valid);
  });

  it("rejects missing postId", () => {
    expectZodFailure(ApprovePostInput, { tenantId: 1 });
  });

  it("rejects missing tenantId", () => {
    expectZodFailure(ApprovePostInput, { postId: 1 });
  });

  it("rejects string postId", () => {
    expectZodFailure(ApprovePostInput, { postId: "1", tenantId: 1 });
  });
});
