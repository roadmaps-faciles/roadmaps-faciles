import { ADDON_TYPE } from "@/lib/model/Organization";

vi.mock("server-only", () => ({}));

// Self-host mode: config has a license key
vi.mock("@/config", () => ({
  config: {
    licenseKey: "rf_live_some-key.some-sig",
  },
}));

const mockGetLicenseStatus = vi.fn();
vi.mock("@/lib/ee/licensing/licenseService", () => ({
  getLicenseStatus: mockGetLicenseStatus,
}));

vi.mock("@/lib/repo", () => ({
  organizationRepo: { findByTenantId: vi.fn() },
  orgAddonRepo: { isActiveForTenant: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  forbidden: () => {
    throw new Error("forbidden");
  },
}));

describe("hasEntitlement — self-host (license mode)", () => {
  let hasEntitlement: typeof import("@/lib/ee/entitlements").hasEntitlement;

  beforeAll(async () => {
    const mod = await import("@/lib/ee/entitlements");
    hasEntitlement = mod.hasEntitlement;
  });

  beforeEach(() => {
    mockGetLicenseStatus.mockReset();
  });

  it("returns true for all addons when license is valid (LICENSED)", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });

    expect(await hasEntitlement(1, ADDON_TYPE.TRACKING)).toBe(true);
    expect(await hasEntitlement(1, ADDON_TYPE.MULTI_TENANT)).toBe(true);
    expect(await hasEntitlement(1, ADDON_TYPE.STORAGE_S3)).toBe(true);
  });

  it("returns false for THEME_DSFR when plan is LICENSED (not GOV_LICENSED)", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });

    expect(await hasEntitlement(1, ADDON_TYPE.THEME_DSFR)).toBe(false);
  });

  it("returns true for THEME_DSFR when plan is GOV_LICENSED", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "GOV_LICENSED" });

    expect(await hasEntitlement(1, ADDON_TYPE.THEME_DSFR)).toBe(true);
  });

  it("returns false for non-free addons when license is invalid", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: false, plan: "LICENSED" });

    expect(await hasEntitlement(1, ADDON_TYPE.TRACKING)).toBe(false);
    expect(await hasEntitlement(1, ADDON_TYPE.MULTI_TENANT)).toBe(false);
  });

  it("returns true for free tier addons even when license is invalid", async () => {
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: false, plan: "LICENSED" });

    expect(await hasEntitlement(1, ADDON_TYPE.STORAGE_S3)).toBe(true);
  });

  it("does not call DB repos in self-host mode", async () => {
    const { organizationRepo, orgAddonRepo } = await import("@/lib/repo");
    mockGetLicenseStatus.mockResolvedValue({ mode: "licensed", valid: true, plan: "LICENSED" });

    await hasEntitlement(1, ADDON_TYPE.TRACKING);

    expect(organizationRepo.findByTenantId).not.toHaveBeenCalled();
    expect(orgAddonRepo.isActiveForTenant).not.toHaveBeenCalled();
  });
});
