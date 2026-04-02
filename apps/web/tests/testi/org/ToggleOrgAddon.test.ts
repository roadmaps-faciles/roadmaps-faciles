import { ToggleOrgAddon } from "@/useCases/ee/organization/ToggleOrgAddon";

import { type createMockOrgAddonRepo as CreateMockOrgAddonRepo, createMockOrgAddonRepo } from "../helpers";

describe("ToggleOrgAddon", () => {
  let mockOrgAddonRepo: ReturnType<typeof CreateMockOrgAddonRepo>;
  let useCase: ToggleOrgAddon;

  beforeEach(() => {
    mockOrgAddonRepo = createMockOrgAddonRepo();
    useCase = new ToggleOrgAddon(mockOrgAddonRepo);
  });

  it("upserts a global addon (tenantId null)", async () => {
    const addon = { id: 1, organizationId: 10, tenantId: null, addon: "TRACKING", active: true };
    mockOrgAddonRepo.upsert.mockResolvedValue(addon);

    const result = await useCase.execute({
      organizationId: 10,
      tenantId: null,
      addon: "TRACKING",
      active: true,
    });

    expect(mockOrgAddonRepo.upsert).toHaveBeenCalledWith({
      organizationId: 10,
      tenantId: null,
      addon: "TRACKING",
      active: true,
    });
    expect(result).toEqual(addon);
  });

  it("upserts a tenant-specific addon", async () => {
    const addon = { id: 2, organizationId: 10, tenantId: 5, addon: "STORAGE_S3", active: false };
    mockOrgAddonRepo.upsert.mockResolvedValue(addon);

    const result = await useCase.execute({
      organizationId: 10,
      tenantId: 5,
      addon: "STORAGE_S3",
      active: false,
    });

    expect(mockOrgAddonRepo.upsert).toHaveBeenCalledWith({
      organizationId: 10,
      tenantId: 5,
      addon: "STORAGE_S3",
      active: false,
    });
    expect(result).toEqual(addon);
  });
});
