import { SubmitPostInput } from "@/useCases/posts/SubmitPost";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("SubmitPostInput schema", () => {
  const validWithUser = {
    title: "Mon post",
    boardId: 1,
    tenantId: 1,
    userId: "user-123",
    requirePostApproval: false,
  };

  const validWithAnonymous = {
    title: "Anonymous post",
    boardId: 1,
    tenantId: 1,
    anonymousId: "anon-456",
    requirePostApproval: false,
  };

  it("accepts valid data with userId", () => {
    expectZodSuccess(SubmitPostInput, validWithUser);
  });

  it("accepts valid data with anonymousId", () => {
    expectZodSuccess(SubmitPostInput, validWithAnonymous);
  });

  it("accepts optional description", () => {
    const data = expectZodSuccess(SubmitPostInput, { ...validWithUser, description: "A description" });
    expect(data.description).toBe("A description");
  });

  it("sets description to undefined when not provided", () => {
    const data = expectZodSuccess(SubmitPostInput, validWithUser);
    expect(data.description).toBeUndefined();
  });

  it("rejects when neither userId nor anonymousId is provided", () => {
    expectZodFailure(
      SubmitPostInput,
      { title: "Post", boardId: 1, tenantId: 1, requirePostApproval: false },
      "Either userId or anonymousId must be provided",
    );
  });

  it("rejects title shorter than 3 characters", () => {
    expectZodFailure(SubmitPostInput, { ...validWithUser, title: "ab" });
  });

  it("rejects empty title", () => {
    expectZodFailure(SubmitPostInput, { ...validWithUser, title: "" });
  });

  it("rejects missing boardId", () => {
    const { boardId: _, ...data } = validWithUser;
    expectZodFailure(SubmitPostInput, data);
  });

  it("rejects missing tenantId", () => {
    const { tenantId: _, ...data } = validWithUser;
    expectZodFailure(SubmitPostInput, data);
  });

  it("rejects missing requirePostApproval", () => {
    const { requirePostApproval: _, ...data } = validWithUser;
    expectZodFailure(SubmitPostInput, data);
  });

  it("rejects non-boolean requirePostApproval", () => {
    expectZodFailure(SubmitPostInput, { ...validWithUser, requirePostApproval: "yes" });
  });
});
