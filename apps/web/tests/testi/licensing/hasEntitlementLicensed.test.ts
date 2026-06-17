import { ADDON_TYPE } from "@/lib/model/Organization";

import { fakeOrganization } from "../helpers";

vi.mock("server-only", () => ({}));

// Self-host mode: license is the ceiling, the instance admin enables each addon per org (override).
vi.mock("@/lib/deployment", () => ({
  isCloud: vi.fn().mockResolvedValue(false),
  isSelfHost: vi.fn().mockResolvedValue(true),
}));

const mockGetLicenseStatus = vi.fn();
vi.mock("@/lib/ee/licensing/licenseService", () => ({
  getLicenseStatus: mockGetLicenseStatus,
}));

const mockFindByTenantId = vi.fn();
const mockIsActiveForTenant = vi.fn();
vi.mock("@/lib/repo", () => ({
  organizationRepo: { findByTenantId: mockFindByTenantId },
  orgAddonRepo: { isActiveForTenant: mockIsActiveForTenant },
}));

vi.mock("next/navigation", () => ({
  forbidden: () => {
    throw new Error("forbidden");
  },
}));

describe("hasEntitlement - self-host (license ceiling + per-org override)", () => {
  let hasEntitlement: typeof import("@/lib/ee/entitlements").hasEntitlement;

  beforeAll(async () => {
    const mod = await import("@/lib/ee/entitlements");
    hasEntitlement = mod.hasEntitlement;
  });

  beforeEach(() => {
    mockGetLicenseStatus.mockReset();
    mockFindByTenantId.mockReset();
    mockIsActiveForTenant.mockReset();
  });

  it("free tier addon (STORAGE_S3) is always available, without checking license or override", async () => {
    expect(await hasEntitlement(1, ADDON_TYPE.STORAGE_S3)).toBe(true);
    expect(mockGetLicenseStatus).not.toHaveBeenCalled();
    expect(mockFindByTenantId).not.toHaveBeenCalled();
  });

  it("returns false for non-free addons when the license is invalid (community)", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "community", valid: false });

    expect(await hasEntitlement(1, ADDON_TYPE.TRACKING)).toBe(false);
    expect(await hasEntitlement(1, ADDON_TYPE.MULTI_TENANT)).toBe(false);
    expect(mockIsActiveForTenant).not.toHaveBeenCalled();
  });

  it("licensed AND the addon is enabled for the org -> true", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockIsActiveForTenant.mockResolvedValue(true);

    expect(await hasEntitlement(1, ADDON_TYPE.SSO_ENTERPRISE)).toBe(true);
    expect(mockIsActiveForTenant).toHaveBeenCalledWith(7, 1, ADDON_TYPE.SSO_ENTERPRISE);
  });

  it("licensed but the addon is NOT enabled for the org -> false", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockIsActiveForTenant.mockResolvedValue(false);

    expect(await hasEntitlement(1, ADDON_TYPE.SSO_ENTERPRISE)).toBe(false);
  });

  it("licensed but org not found -> false", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });
    mockFindByTenantId.mockResolvedValue(null);

    expect(await hasEntitlement(1, ADDON_TYPE.TRACKING)).toBe(false);
  });

  it("THEME_DSFR requires a GOV license: false on a plain LICENSED plan (no override check)", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });

    expect(await hasEntitlement(1, ADDON_TYPE.THEME_DSFR)).toBe(false);
    expect(mockIsActiveForTenant).not.toHaveBeenCalled();
  });

  it("THEME_DSFR on a GOV license AND enabled for the org -> true", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "GOV_LICENSED" });
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 7 }));
    mockIsActiveForTenant.mockResolvedValue(true);

    expect(await hasEntitlement(1, ADDON_TYPE.THEME_DSFR)).toBe(true);
  });
});
