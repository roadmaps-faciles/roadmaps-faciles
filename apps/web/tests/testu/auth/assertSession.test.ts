import { type Session } from "next-auth";
import { vi } from "vitest";

import { type UserRole, type UserStatus } from "@/prisma/enums";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  forbidden: vi.fn(() => {
    throw new Error("FORBIDDEN");
  }),
  redirect: vi.fn(),
}));

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// Mock auth
const mockAuth = vi.fn<() => Promise<null | Session>>();
vi.mock("@/lib/next-auth/auth", () => ({
  auth: () => mockAuth(),
}));

// Mock tenant lookup
const mockGetTenantFromDomain = vi.fn();
vi.mock("@/utils/tenant", () => ({
  getTenantFromDomain: (...args: unknown[]) => mockGetTenantFromDomain(...args),
}));

// Mock repos
const mockFindMembership = vi.fn();
const mockFindById = vi.fn();
vi.mock("@/lib/repo", () => ({
  userOnTenantRepo: { findMembership: (...args: unknown[]) => mockFindMembership(...args) },
  userRepo: { findById: (...args: unknown[]) => mockFindById(...args) },
}));

function fakeSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    user: {
      uuid: "user-1",
      email: "test@test.com",
      name: "Test",
      isSuperAdmin: false,
      isBetaGouvMember: false,
      role: "USER" as UserRole,
      status: "ACTIVE" as UserStatus,
      username: "testuser",
      ...overrides,
    },
    expires: "2099-01-01",
  };
}

describe("assertSession", () => {
  let assertSession: typeof import("@/utils/auth").assertSession;
  let assertTenantAdmin: typeof import("@/utils/auth").assertTenantAdmin;
  let assertTenantOwner: typeof import("@/utils/auth").assertTenantOwner;
  let assertPublicAccess: typeof import("@/utils/auth").assertPublicAccess;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/utils/auth");
    assertSession = mod.assertSession;
    assertTenantAdmin = mod.assertTenantAdmin;
    assertTenantOwner = mod.assertTenantOwner;
    assertPublicAccess = mod.assertPublicAccess;
  });

  it("returns session when no checks", async () => {
    const session = fakeSession();
    mockAuth.mockResolvedValue(session);

    const result = await assertSession();
    expect(result).toBe(session);
  });

  it("throws when no session", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(assertSession()).rejects.toThrow();
  });

  describe("super admin bypass", () => {
    it("bypasses rootUser check", async () => {
      const session = fakeSession({ isSuperAdmin: true, role: "USER" as UserRole });
      mockAuth.mockResolvedValue(session);

      const result = await assertSession({ rootUser: { role: { min: "ADMIN" as UserRole } } });
      expect(result).toBe(session);
    });

    it("bypasses tenantUser check without requiring membership", async () => {
      const session = fakeSession({ isSuperAdmin: true });
      mockAuth.mockResolvedValue(session);

      const result = await assertSession({
        tenantUser: { domain: "test.example.com", role: { min: "ADMIN" as UserRole } },
      });
      expect(result).toBe(session);
      // Should NOT call getTenantFromDomain or findMembership
      expect(mockGetTenantFromDomain).not.toHaveBeenCalled();
      expect(mockFindMembership).not.toHaveBeenCalled();
    });

    it("bypasses assertTenantAdmin", async () => {
      const session = fakeSession({ isSuperAdmin: true });
      mockAuth.mockResolvedValue(session);

      const result = await assertTenantAdmin("test.example.com");
      expect(result).toBe(session);
      expect(mockGetTenantFromDomain).not.toHaveBeenCalled();
    });
  });

  describe("tenantUser check", () => {
    it("fails when user has no membership", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue(null);

      await expect(
        assertSession({ tenantUser: { domain: "test.example.com", role: { min: "USER" as UserRole } } }),
      ).rejects.toThrow();
    });

    it("succeeds when user has sufficient role", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" });

      const result = await assertSession({
        tenantUser: { domain: "test.example.com", role: { min: "ADMIN" as UserRole } },
      });
      expect(result).toBe(session);
    });

    it("fails when user has insufficient role", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue({ role: "USER", status: "ACTIVE" });

      await expect(
        assertSession({ tenantUser: { domain: "test.example.com", role: { min: "ADMIN" as UserRole } } }),
      ).rejects.toThrow();
    });

    it("fails when user has insufficient status", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue({ role: "ADMIN", status: "BLOCKED" });

      await expect(
        assertSession({
          tenantUser: {
            domain: "test.example.com",
            role: { min: "USER" as UserRole },
            status: { min: "ACTIVE" as UserStatus },
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe("rootUser check", () => {
    it("fails when root user has insufficient status", async () => {
      const session = fakeSession({ status: "BLOCKED" as UserStatus });
      mockAuth.mockResolvedValue(session);

      await expect(assertSession({ rootUser: { status: { only: "ACTIVE" as UserStatus } } })).rejects.toThrow();
    });

    it("succeeds with sufficient root role", async () => {
      const session = fakeSession({ role: "ADMIN" as UserRole });
      mockAuth.mockResolvedValue(session);

      const result = await assertSession({ rootUser: { role: { min: "ADMIN" as UserRole } } });
      expect(result).toBe(session);
    });
  });

  describe("useForbidden", () => {
    it("calls forbidden() when useForbidden is true and no session", async () => {
      mockAuth.mockResolvedValue(null);

      await expect(assertSession({ useForbidden: true })).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("AssertParam with message", () => {
    it("accepts rootUser with check/message format", async () => {
      const session = fakeSession({ role: "ADMIN" as UserRole });
      mockAuth.mockResolvedValue(session);

      const result = await assertSession({
        rootUser: { check: { role: { min: "ADMIN" as UserRole } }, message: "Custom message" },
      });
      expect(result).toBe(session);
    });

    it("accepts tenantUser with check/message format", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" });

      const result = await assertSession({
        tenantUser: { check: { domain: "test.example.com", role: { min: "USER" as UserRole } }, message: "Custom" },
      });
      expect(result).toBe(session);
    });
  });

  describe("assertTenantOwner", () => {
    it("succeeds when user is OWNER", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue({ role: "OWNER", status: "ACTIVE" });

      const result = await assertTenantOwner("test.example.com");
      expect(result).toBe(session);
    });

    it("fails when user is ADMIN (not OWNER)", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);
      mockGetTenantFromDomain.mockResolvedValue({ id: 1 });
      mockFindMembership.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" });

      await expect(assertTenantOwner("test.example.com")).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("assertPublicAccess", () => {
    it("does nothing when site is not private", async () => {
      await assertPublicAccess({ isPrivate: false } as Parameters<typeof assertPublicAccess>[0], "/login");
      expect(mockAuth).not.toHaveBeenCalled();
    });

    it("does nothing when site is private and user is authenticated", async () => {
      const session = fakeSession();
      mockAuth.mockResolvedValue(session);

      await assertPublicAccess({ isPrivate: true } as Parameters<typeof assertPublicAccess>[0], "/login");
    });

    it("redirects when site is private and user is not authenticated", async () => {
      const { redirect } = await import("next/navigation");
      mockAuth.mockResolvedValue(null);

      await assertPublicAccess({ isPrivate: true } as Parameters<typeof assertPublicAccess>[0], "/login");
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
