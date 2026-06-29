const mockGetTenantFromDomain = vi.fn();
vi.mock("@/utils/tenant", () => ({
  getTenantFromDomain: (...args: unknown[]) => mockGetTenantFromDomain(...args),
}));

const mockSettingsFindFirst = vi.fn();
const mockPostFindUnique = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tenantSettings: { findFirst: (...args: unknown[]) => mockSettingsFindFirst(...args) },
    post: { findUnique: (...args: unknown[]) => mockPostFindUnique(...args) },
  },
}));

vi.mock("@/config", () => ({
  config: { host: "https://roadmaps-faciles.fr" },
}));

const { generatePostMetadata } = await import("@/utils/metadata");

const TENANT = { id: 1 };
const SETTINGS = { name: "TACCT", subdomain: "tacct", customDomain: null };
const basePost = {
  title: "Public roadmap post",
  description: "A normal public description",
  board: { name: "feature" },
  user: { name: "Alice" },
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("generatePostMetadata", () => {
  beforeEach(() => {
    mockGetTenantFromDomain.mockReset();
    mockSettingsFindFirst.mockReset();
    mockPostFindUnique.mockReset();
    mockGetTenantFromDomain.mockResolvedValue(TENANT);
    mockSettingsFindFirst.mockResolvedValue(SETTINGS);
  });

  it("exposes metadata for an approved post", async () => {
    mockPostFindUnique.mockResolvedValue({ ...basePost, approvalStatus: "APPROVED" });
    const meta = await generatePostMetadata("tacct.roadmaps-faciles.fr", "113");
    expect(meta.title).toBe("Public roadmap post");
  });

  // Regression: posts pending moderation must not leak title/description via OG tags.
  it("does NOT expose metadata for a pending (unmoderated) post", async () => {
    mockPostFindUnique.mockResolvedValue({ ...basePost, title: "PENDING-SECRET", approvalStatus: "PENDING" });
    const meta = await generatePostMetadata("tacct.roadmaps-faciles.fr", "113");
    expect(meta).toEqual({});
    expect(JSON.stringify(meta)).not.toContain("PENDING-SECRET");
  });

  it("does NOT expose metadata for a rejected post", async () => {
    mockPostFindUnique.mockResolvedValue({ ...basePost, title: "REJECTED-SECRET", approvalStatus: "REJECTED" });
    const meta = await generatePostMetadata("tacct.roadmaps-faciles.fr", "113");
    expect(meta).toEqual({});
  });

  it("returns empty metadata when the post does not exist", async () => {
    mockPostFindUnique.mockResolvedValue(null);
    const meta = await generatePostMetadata("tacct.roadmaps-faciles.fr", "999");
    expect(meta).toEqual({});
  });
});
