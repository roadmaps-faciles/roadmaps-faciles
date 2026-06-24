import { StatusCodes } from "http-status-codes";

const mockFindByVerifiedCustomDomain = vi.fn();
const mockFindBySubdomain = vi.fn();
vi.mock("@/lib/repo", () => ({
  tenantRepo: {
    findByVerifiedCustomDomain: (...args: unknown[]) => mockFindByVerifiedCustomDomain(...args),
    findBySubdomain: (...args: unknown[]) => mockFindBySubdomain(...args),
  },
}));

vi.mock("@/config", () => ({
  config: { rootDomain: "roadmaps-faciles.fr" },
}));

const { GET } = await import("@/app/(default)/api/domains/check/route");

const call = (domain: string) => GET(new Request(`http://localhost/api/domains/check?domain=${domain}`));

describe("GET /api/domains/check", () => {
  beforeEach(() => {
    mockFindByVerifiedCustomDomain.mockReset();
    mockFindBySubdomain.mockReset();
    mockFindByVerifiedCustomDomain.mockResolvedValue(null);
    mockFindBySubdomain.mockResolvedValue(null);
  });

  it("returns OK for a verified custom domain", async () => {
    mockFindByVerifiedCustomDomain.mockResolvedValue({ id: 1 });
    const res = await call("feedback.example.com");
    expect(res.status).toBe(StatusCodes.OK);
    expect(mockFindByVerifiedCustomDomain).toHaveBeenCalledWith("feedback.example.com");
  });

  it("returns NOT_FOUND for an unverified/forged custom domain", async () => {
    mockFindByVerifiedCustomDomain.mockResolvedValue(null); // unverified → not resolved
    const res = await call("forged.example.com");
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    expect(mockFindBySubdomain).not.toHaveBeenCalled();
  });

  it("falls back to subdomain resolution", async () => {
    mockFindBySubdomain.mockResolvedValue({ id: 2 });
    const res = await call("foo.roadmaps-faciles.fr");
    expect(res.status).toBe(StatusCodes.OK);
    expect(mockFindBySubdomain).toHaveBeenCalledWith("foo");
  });

  it("rejects a malformed domain", async () => {
    const res = await call("not a domain!");
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
