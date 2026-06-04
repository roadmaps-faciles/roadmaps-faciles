import { ADDON_TYPE } from "@/lib/model/Organization";

import { fakeOrganization } from "../helpers";

vi.mock("server-only", () => ({}));

// Cloud mode: DB-based entitlements
vi.mock("@/lib/deployment", () => ({
  isCloud: vi.fn().mockResolvedValue(true),
  isSelfHost: vi.fn().mockResolvedValue(false),
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

describe("hasEntitlement", () => {
  let hasEntitlement: typeof import("@/lib/ee/entitlements").hasEntitlement;

  beforeAll(async () => {
    const mod = await import("@/lib/ee/entitlements");
    hasEntitlement = mod.hasEntitlement;
  });

  beforeEach(() => {
    mockFindByTenantId.mockReset();
    mockIsActiveForTenant.mockReset();
  });

  it("returns false when org is not found", async () => {
    mockFindByTenantId.mockResolvedValue(null);

    const result = await hasEntitlement(1, ADDON_TYPE.TRACKING);

    expect(result).toBe(false);
  });

  it("returns true for THEME_DSFR when org has GOV plan", async () => {
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 1, plan: "GOV" }));

    const result = await hasEntitlement(1, ADDON_TYPE.THEME_DSFR);

    expect(result).toBe(true);
  });

  it("returns false for THEME_DSFR when org has BASE plan", async () => {
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 1, plan: "BASE" }));

    const result = await hasEntitlement(1, ADDON_TYPE.THEME_DSFR);

    expect(result).toBe(false);
  });

  it("returns true when global addon is active", async () => {
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 1 }));
    mockIsActiveForTenant.mockResolvedValue(true);

    const result = await hasEntitlement(1, ADDON_TYPE.TRACKING);

    expect(result).toBe(true);
    expect(mockIsActiveForTenant).toHaveBeenCalledWith(1, 1, ADDON_TYPE.TRACKING);
  });

  it("returns true for any addon when org has GRANTED_FREE plan", async () => {
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 1, plan: "GRANTED_FREE" }));

    const result = await hasEntitlement(1, ADDON_TYPE.TRACKING);

    expect(result).toBe(true);
    expect(mockIsActiveForTenant).not.toHaveBeenCalled();
  });

  it("returns true for any addon when org has GOV plan", async () => {
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 1, plan: "GOV" }));

    const result = await hasEntitlement(1, ADDON_TYPE.TRACKING);

    expect(result).toBe(true);
    expect(mockIsActiveForTenant).not.toHaveBeenCalled();
  });

  it("returns false when addon is not active and not in free tier", async () => {
    mockFindByTenantId.mockResolvedValue(fakeOrganization({ id: 1 }));
    mockIsActiveForTenant.mockResolvedValue(false);

    const result = await hasEntitlement(1, ADDON_TYPE.TRACKING);

    expect(result).toBe(false);
  });
});
