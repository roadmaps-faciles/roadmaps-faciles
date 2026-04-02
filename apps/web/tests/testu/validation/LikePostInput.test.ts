import { LikePostInput } from "@/useCases/likes/LikePost";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("LikePostInput schema", () => {
  const validWithUser = {
    postId: 1,
    tenantId: 1,
    userId: "user-123",
  };

  const validWithAnonymous = {
    postId: 1,
    tenantId: 1,
    anonymousId: "anon-456",
  };

  it("accepts valid data with userId", () => {
    expectZodSuccess(LikePostInput, validWithUser);
  });

  it("accepts valid data with anonymousId", () => {
    expectZodSuccess(LikePostInput, validWithAnonymous);
  });

  it("accepts data with both userId and anonymousId", () => {
    expectZodSuccess(LikePostInput, { ...validWithUser, anonymousId: "anon-456" });
  });

  it("rejects when neither userId nor anonymousId is provided", () => {
    expectZodFailure(LikePostInput, { postId: 1, tenantId: 1 }, "Either userId or anonymousId must be provided");
  });

  it("rejects missing postId", () => {
    const { postId: _, ...data } = validWithUser;
    expectZodFailure(LikePostInput, data);
  });

  it("rejects missing tenantId", () => {
    const { tenantId: _, ...data } = validWithUser;
    expectZodFailure(LikePostInput, data);
  });
});
