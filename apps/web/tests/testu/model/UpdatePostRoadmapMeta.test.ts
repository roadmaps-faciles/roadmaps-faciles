import { UpdatePostRoadmapMetaInput } from "@/useCases/posts/UpdatePostRoadmapMeta";

describe("UpdatePostRoadmapMetaInput", () => {
  const base = { postId: 1, tenantId: 1 };

  it("accepts null progress and eta", () => {
    const result = UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: null, eta: null });
    expect(result.success).toBe(true);
  });

  it("accepts progress between 0 and 100", () => {
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: 0, eta: null }).success).toBe(true);
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: 50, eta: null }).success).toBe(true);
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: 100, eta: null }).success).toBe(true);
  });

  it("rejects progress below 0", () => {
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: -1, eta: null }).success).toBe(false);
  });

  it("rejects progress above 100", () => {
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: 101, eta: null }).success).toBe(false);
  });

  it("rejects non-integer progress", () => {
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: 50.5, eta: null }).success).toBe(false);
  });

  it("rejects empty eta string", () => {
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: null, eta: "" }).success).toBe(false);
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: null, eta: "   " }).success).toBe(false);
  });

  it("rejects eta longer than 64 chars", () => {
    expect(UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: null, eta: "x".repeat(65) }).success).toBe(false);
  });

  it("trims eta whitespace", () => {
    const result = UpdatePostRoadmapMetaInput.safeParse({ ...base, progress: null, eta: "  Q3 2026  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eta).toBe("Q3 2026");
    }
  });
});
