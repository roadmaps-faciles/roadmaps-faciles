import { NextRequest } from "next/server";

const mockFindByVerifiedCustomDomain = vi.fn();
const mockFindBySubdomain = vi.fn();
const mockFindMembership = vi.fn();
vi.mock("@/lib/repo", () => ({
  tenantRepo: {
    findByVerifiedCustomDomain: (...args: unknown[]) => mockFindByVerifiedCustomDomain(...args),
    findBySubdomain: (...args: unknown[]) => mockFindBySubdomain(...args),
  },
  userOnTenantRepo: {
    findMembership: (...args: unknown[]) => mockFindMembership(...args),
  },
}));

const mockAuth = vi.fn();
vi.mock("@/lib/next-auth/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/authBridge", () => ({
  createBridgeToken: () => "bridge-token",
}));

vi.mock("@/config", () => ({
  config: { host: "http://localhost" },
}));

const { GET } = await import("@/app/(default)/api/auth-bridge/route");

const call = (redirect: string) =>
  GET(new NextRequest(`http://localhost/api/auth-bridge?redirect=${encodeURIComponent(redirect)}`));

describe("GET /api/auth-bridge custom domain gating", () => {
  beforeEach(() => {
    mockFindByVerifiedCustomDomain.mockReset();
    mockFindBySubdomain.mockReset();
    mockFindMembership.mockReset();
    mockAuth.mockReset();
    mockFindByVerifiedCustomDomain.mockResolvedValue(null);
    mockAuth.mockResolvedValue(null);
  });

  it("rejects a redirect to an unverified custom domain (back to root, no bridge)", async () => {
    mockFindByVerifiedCustomDomain.mockResolvedValue(null); // forged/unverified
    const res = await call("https://forged.example.com/board");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
    expect(mockFindByVerifiedCustomDomain).toHaveBeenCalledWith("forged.example.com");
  });

  it("accepts a verified custom domain through the open-redirect guard", async () => {
    mockFindByVerifiedCustomDomain.mockResolvedValue({ id: 1 }); // verified
    mockAuth.mockResolvedValue(null); // not logged in → redirected to login (guard already passed)
    const res = await call("https://feedback.example.com/board");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });
});
