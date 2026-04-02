import { UpdatePostContentInput } from "@/useCases/posts/UpdatePostContent";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("UpdatePostContentInput schema", () => {
  const valid = {
    postId: 1,
    tenantId: 1,
    title: "Updated title",
    editedById: "user-123",
  };

  it("accepts valid data", () => {
    expectZodSuccess(UpdatePostContentInput, valid);
  });

  it("accepts optional description", () => {
    const data = expectZodSuccess(UpdatePostContentInput, { ...valid, description: "Desc" });
    expect(data.description).toBe("Desc");
  });

  it("sets description to undefined when not provided", () => {
    const data = expectZodSuccess(UpdatePostContentInput, valid);
    expect(data.description).toBeUndefined();
  });

  it("accepts optional tags array", () => {
    const data = expectZodSuccess(UpdatePostContentInput, { ...valid, tags: ["bug", "feature"] });
    expect(data.tags).toEqual(["bug", "feature"]);
  });

  it("accepts empty tags array", () => {
    const data = expectZodSuccess(UpdatePostContentInput, { ...valid, tags: [] });
    expect(data.tags).toEqual([]);
  });

  it("rejects title shorter than 3 characters", () => {
    expectZodFailure(UpdatePostContentInput, { ...valid, title: "ab" });
  });

  it("rejects empty title", () => {
    expectZodFailure(UpdatePostContentInput, { ...valid, title: "" });
  });

  it("rejects missing editedById", () => {
    const { editedById: _, ...data } = valid;
    expectZodFailure(UpdatePostContentInput, data);
  });

  it("rejects missing postId", () => {
    const { postId: _, ...data } = valid;
    expectZodFailure(UpdatePostContentInput, data);
  });

  it("rejects missing tenantId", () => {
    const { tenantId: _, ...data } = valid;
    expectZodFailure(UpdatePostContentInput, data);
  });
});
