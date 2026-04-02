import { ChangePostStatusInput } from "@/useCases/post_status_changes/ChangePostStatus";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("ChangePostStatusInput schema", () => {
  const valid = {
    postId: 1,
    fromStatusId: 1,
    toStatusId: 2,
    userId: "user-123",
    tenantId: 1,
  };

  it("accepts valid data", () => {
    expectZodSuccess(ChangePostStatusInput, valid);
  });

  it("accepts null fromStatusId (initial status)", () => {
    const data = expectZodSuccess(ChangePostStatusInput, { ...valid, fromStatusId: null });
    expect(data.fromStatusId).toBeNull();
  });

  it("rejects missing postId", () => {
    const { postId: _, ...data } = valid;
    expectZodFailure(ChangePostStatusInput, data);
  });

  it("rejects missing toStatusId", () => {
    const { toStatusId: _, ...data } = valid;
    expectZodFailure(ChangePostStatusInput, data);
  });

  it("rejects missing userId", () => {
    const { userId: _, ...data } = valid;
    expectZodFailure(ChangePostStatusInput, data);
  });

  it("rejects missing tenantId", () => {
    const { tenantId: _, ...data } = valid;
    expectZodFailure(ChangePostStatusInput, data);
  });

  it("rejects string toStatusId", () => {
    expectZodFailure(ChangePostStatusInput, { ...valid, toStatusId: "2" });
  });
});
