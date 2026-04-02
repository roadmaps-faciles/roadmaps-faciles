import { type Session } from "next-auth";
import { vi } from "vitest";

import { type UserRole, type UserStatus } from "@/prisma/enums";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  forbidden: vi.fn(() => {
    throw new Error("FORBIDDEN");
  }),
}));

// Mock React.cache — passthrough (no caching in tests)
vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

// Mock appSettingsRepo
const mockGet = vi.fn();
vi.mock("@/lib/repo", () => ({
  appSettingsRepo: { get: () => mockGet() },
}));

// Dynamic import AFTER mocks are set up
const { getFeatureFlags, getEffectiveFlags, isFeatureEnabled, assertFeature, FEATURE_FLAGS } =
  await import("@/lib/feature-flags");

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
      twoFactorEnabled: false,
      emailVerified: new Date(),
      id: "user-1",
      ...overrides,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
    twoFactorRequired: false,
    twoFactorVerified: false,
  };
}

function fakeAppSettings(featureFlags: unknown = null) {
  return {
    id: 0,
    force2FA: false,
    force2FAGraceDays: 5,
    featureFlags,
    pinnedTenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("Feature Flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFeatureFlags", () => {
    it("returns defaults when DB has no overrides (null)", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));

      const flags = await getFeatureFlags();

      expect(flags).toEqual({ ...FEATURE_FLAGS });
    });

    it("returns defaults when DB has empty object", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({}));

      const flags = await getFeatureFlags();

      expect(flags).toEqual({ ...FEATURE_FLAGS });
    });

    it("ignores unknown keys in DB overrides", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ unknownFlag: true, anotherUnknown: false }));

      const flags = await getFeatureFlags();

      expect(flags).toEqual({ ...FEATURE_FLAGS });
      expect(flags).not.toHaveProperty("unknownFlag");
      expect(flags).not.toHaveProperty("anotherUnknown");
    });

    it("ignores non-boolean values in DB overrides", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ someKey: "string", another: 42 }));

      const flags = await getFeatureFlags();

      expect(flags).toEqual({ ...FEATURE_FLAGS });
    });
  });

  describe("getEffectiveFlags", () => {
    it("returns raw flags for normal user", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));
      const session = fakeSession();

      const flags = await getEffectiveFlags(session);

      expect(flags).toEqual({ ...FEATURE_FLAGS });
    });

    it("returns raw flags for null session", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));

      const flags = await getEffectiveFlags(null);

      expect(flags).toEqual({ ...FEATURE_FLAGS });
    });

    it("forces all flags to true for super admin", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));
      const session = fakeSession({ isSuperAdmin: true });

      const flags = await getEffectiveFlags(session);

      for (const value of Object.values(flags)) {
        expect(value).toBe(true);
      }
    });
  });

  describe("isFeatureEnabled", () => {
    it("returns true for super admin regardless of flag state", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));
      const session = fakeSession({ isSuperAdmin: true });

      // With empty registry, we can't call with a real key,
      // but we can verify the super admin bypass
      const result = await isFeatureEnabled("anyFlag" as never, session);

      expect(result).toBe(true);
      // Should not even hit the repo
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("assertFeature", () => {
    it("throws forbidden for disabled flag with normal user", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));
      const session = fakeSession();

      await expect(assertFeature("disabledFlag" as never, session)).rejects.toThrow("FORBIDDEN");
    });

    it("does not throw for super admin", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));
      const session = fakeSession({ isSuperAdmin: true });

      await expect(assertFeature("anyFlag" as never, session)).resolves.toBeUndefined();
    });
  });
});
