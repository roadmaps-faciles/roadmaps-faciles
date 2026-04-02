import { type Session } from "next-auth";
import { vi } from "vitest";

import { type UserRole, type UserStatus } from "@/prisma/enums";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  forbidden: vi.fn(() => {
    throw new Error("FORBIDDEN");
  }),
}));

// Mock React.cache — passthrough
vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

// Mock FEATURE_FLAGS with a real flag to test merge behavior
vi.mock("@/lib/feature-flags/flags", () => ({
  FEATURE_FLAGS: {
    testFeature: false,
    anotherFeature: true,
  } as Record<string, boolean>,
}));

// Mock appSettingsRepo
const mockGet = vi.fn();
vi.mock("@/lib/repo", () => ({
  appSettingsRepo: { get: () => mockGet() },
}));

const { getFeatureFlags, getEffectiveFlags, isFeatureEnabled, assertFeature } = await import("@/lib/feature-flags");

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

describe("Feature Flags — merge with populated registry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFeatureFlags — merge behavior", () => {
    it("returns defaults when DB is null", async () => {
      mockGet.mockResolvedValue(fakeAppSettings(null));

      const flags = await getFeatureFlags();

      expect(flags).toEqual({ testFeature: false, anotherFeature: true });
    });

    it("overrides defaults with DB values", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: true }));

      const flags = await getFeatureFlags();

      expect(flags.testFeature).toBe(true);
      expect(flags.anotherFeature).toBe(true); // unchanged default
    });

    it("ignores unknown keys from DB", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: true, removedFlag: true }));

      const flags = await getFeatureFlags();

      expect(flags).toEqual({ testFeature: true, anotherFeature: true });
      expect(flags).not.toHaveProperty("removedFlag");
    });

    it("ignores non-boolean DB values", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: "yes", anotherFeature: 1 }));

      const flags = await getFeatureFlags();

      expect(flags.testFeature).toBe(false); // keeps default
      expect(flags.anotherFeature).toBe(true); // keeps default
    });
  });

  describe("4 cases: flag on/off × super admin/user", () => {
    it("flag ON + normal user → enabled", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: true }));
      const session = fakeSession();

      const enabled = await isFeatureEnabled("testFeature" as never, session);

      expect(enabled).toBe(true);
    });

    it("flag ON + super admin → enabled", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: true }));
      const session = fakeSession({ isSuperAdmin: true });

      const enabled = await isFeatureEnabled("testFeature" as never, session);

      expect(enabled).toBe(true);
    });

    it("flag OFF + super admin → enabled (bypass)", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: false }));
      const session = fakeSession({ isSuperAdmin: true });

      const enabled = await isFeatureEnabled("testFeature" as never, session);

      expect(enabled).toBe(true);
    });

    it("flag OFF + normal user → disabled", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: false }));
      const session = fakeSession();

      const enabled = await isFeatureEnabled("testFeature" as never, session);

      expect(enabled).toBe(false);
    });
  });

  describe("getEffectiveFlags — super admin bypass with real flags", () => {
    it("forces all flags to true for super admin", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: false }));
      const session = fakeSession({ isSuperAdmin: true });

      const flags = await getEffectiveFlags(session);

      expect(flags.testFeature).toBe(true);
      expect(flags.anotherFeature).toBe(true);
    });

    it("preserves actual flag values for normal user", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: false }));
      const session = fakeSession();

      const flags = await getEffectiveFlags(session);

      expect(flags.testFeature).toBe(false);
      expect(flags.anotherFeature).toBe(true);
    });
  });

  describe("assertFeature — with real flags", () => {
    it("throws forbidden when flag is OFF for normal user", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: false }));
      const session = fakeSession();

      await expect(assertFeature("testFeature" as never, session)).rejects.toThrow("FORBIDDEN");
    });

    it("does not throw when flag is ON for normal user", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: true }));
      const session = fakeSession();

      await expect(assertFeature("testFeature" as never, session)).resolves.toBeUndefined();
    });

    it("does not throw when flag is OFF for super admin (bypass)", async () => {
      mockGet.mockResolvedValue(fakeAppSettings({ testFeature: false }));
      const session = fakeSession({ isSuperAdmin: true });

      await expect(assertFeature("testFeature" as never, session)).resolves.toBeUndefined();
    });
  });
});
