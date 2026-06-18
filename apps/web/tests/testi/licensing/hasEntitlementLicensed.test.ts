import { ADDON_TYPE } from "@/lib/model/Organization";

import { fakeOrganization } from "../helpers";

vi.mock("server-only", () => ({}));

// Self-host mode: the license is the ceiling; every covered addon is ON by default, the instance admin
// can turn one OFF per org (denylist override).
vi.mock("@/lib/deployment", () => ({
  isCloud: vi.fn().mockResolvedValue(false),
  isSelfHost: vi.fn().mockResolvedValue(true),
}));

const mockGetLicenseStatus = vi.fn();
vi.mock("@/lib/ee/licensing/licenseService", () => ({
  getLicenseStatus: mockGetLicenseStatus,
}));

const mockFindByTenantId = vi.fn();
const mockListOverrides = vi.fn();
vi.mock("@/lib/repo", () => ({
  organizationRepo: { findByTenantId: mockFindByTenantId },
  orgAddonRepo: { listOverridesForTenant: mockListOverrides },
}));

vi.mock("next/navigation", () => ({
  forbidden: () => {
    throw new Error("forbidden");
  },
}));

describe("hasEntitlement - self-host (license ceiling + per-org denylist)", () => {
  let hasEntitlement: typeof import("@/lib/ee/entitlements").hasEntitlement;
  let hasEntitlements: typeof import("@/lib/ee/entitlements").hasEntitlements;

  beforeAll(async () => {
    const mod = await import("@/lib/ee/entitlements");
    hasEntitlement = mod.hasEntitlement;
    hasEntitlements = mod.hasEntitlements;
  });

  beforeEach(() => {
    mockGetLicenseStatus.mockReset();
    mockFindByTenantId.mockReset();
    mockListOverrides.mockReset();
    mockListOverrides.mockResolvedValue([]);
  });

  it("free tier addon (STORAGE_S3) is always available, without an org/override lookup", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "community", valid: false });

    expect(await hasEntitlement(1, ADDON_TYPE.STORAGE_S3)).toBe(true);
    expect(mockFindByTenantId).not.toHaveBeenCalled();
  });

  it("returns false for non-free addons when the license is invalid (community)", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "community", valid: false });

    expect(await hasEntitlement(1, ADDON_TYPE.TRACKING)).toBe(false);
    expect(await hasEntitlement(1, ADDON_TYPE.MULTI_TENANT)).toBe(false);
    expect(mockListOverrides).not.toHaveBeenCalled();
  });

  it("licensed and the addon is NOT disabled for the org -> true (on by default)", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockListOverrides.mockResolvedValue([]);

    expect(await hasEntitlement(1, ADDON_TYPE.SSO_ENTERPRISE)).toBe(true);
    expect(mockListOverrides).toHaveBeenCalledWith(7, 1, false);
  });

  it("licensed but the addon is explicitly disabled for the org -> false", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockListOverrides.mockResolvedValue([ADDON_TYPE.SSO_ENTERPRISE]);

    expect(await hasEntitlement(1, ADDON_TYPE.SSO_ENTERPRISE)).toBe(false);
  });

  it("batch resolves several addons in one override lookup", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockListOverrides.mockResolvedValue([ADDON_TYPE.WEBHOOKS]);

    const result = await hasEntitlements(1, [ADDON_TYPE.SSO_ENTERPRISE, ADDON_TYPE.WEBHOOKS, ADDON_TYPE.STORAGE_S3]);

    expect(result).toEqual({ SSO_ENTERPRISE: true, WEBHOOKS: false, STORAGE_S3: true });
    expect(mockListOverrides).toHaveBeenCalledTimes(1);
  });

  it("licensed but org not found -> false", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(null);

    expect(await hasEntitlement(1, ADDON_TYPE.TRACKING)).toBe(false);
  });

  it("THEME_DSFR requires a GOV license: false on a plain LICENSED plan", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));

    expect(await hasEntitlement(1, ADDON_TYPE.THEME_DSFR)).toBe(false);
  });

  it("THEME_DSFR on a GOV license and not disabled for the org -> true", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "GOV_LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockListOverrides.mockResolvedValue([]);

    expect(await hasEntitlement(1, ADDON_TYPE.THEME_DSFR)).toBe(true);
  });
});
