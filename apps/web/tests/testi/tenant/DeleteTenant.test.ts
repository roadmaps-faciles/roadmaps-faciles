import { UserRole } from "@/prisma/enums";
import { DeleteTenant } from "@/useCases/tenant/DeleteTenant";

import {
  type createMockTenantRepo as CreateMockTenantRepo,
  type createMockUserOnTenantRepo as CreateMockUserOnTenantRepo,
  createMockTenantRepo,
  createMockUserOnTenantRepo,
  fakeTenant,
  fakeTenantSettings,
} from "../helpers";

const mockRemoveDomain = vi.fn();
vi.mock("@/lib/ee/domain-provider", () => ({
  getDomainProvider: () => ({ removeDomain: mockRemoveDomain }),
}));

const mockRemoveRecord = vi.fn();
vi.mock("@/lib/ee/dns-provider", () => ({
  getDnsProvider: () => ({ removeRecord: mockRemoveRecord }),
}));

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
    host: "http://localhost:3000",
  },
}));

describe("DeleteTenant", () => {
  let mockTenantRepo: ReturnType<typeof CreateMockTenantRepo>;
  let mockUserOnTenantRepo: ReturnType<typeof CreateMockUserOnTenantRepo>;
  let useCase: DeleteTenant;

  beforeEach(() => {
    mockTenantRepo = createMockTenantRepo();
    mockUserOnTenantRepo = createMockUserOnTenantRepo();
    useCase = new DeleteTenant(mockTenantRepo, mockUserOnTenantRepo);
    mockRemoveDomain.mockReset();
    mockRemoveRecord.mockReset();
  });

  it("deletes a tenant by OWNER with domain/DNS cleanup", async () => {
    const tenant = {
      ...fakeTenant({ id: 1 }),
      settings: fakeTenantSettings({ subdomain: "test", customDomain: "custom.com" }),
    };
    mockTenantRepo.findByIdWithSettings.mockResolvedValue(tenant);
    mockUserOnTenantRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.OWNER,
      status: "ACTIVE",
    });
    mockTenantRepo.update.mockResolvedValue({});
    mockRemoveDomain.mockResolvedValue(undefined);
    mockRemoveRecord.mockResolvedValue(undefined);

    await useCase.execute({ tenantId: 1, userId: "user-1" });

    expect(mockTenantRepo.update).toHaveBeenCalledWith(1, { deletedAt: expect.any(Date) });
    expect(mockRemoveDomain).toHaveBeenCalledWith("test.localhost:3000");
    expect(mockRemoveDomain).toHaveBeenCalledWith("custom.com");
    expect(mockRemoveRecord).toHaveBeenCalledWith("test");
  });

  it("throws when tenant is not found", async () => {
    mockTenantRepo.findByIdWithSettings.mockResolvedValue(null);

    await expect(useCase.execute({ tenantId: 999, userId: "user-1" })).rejects.toThrow("Tenant introuvable.");
  });

  it("throws when user is not OWNER", async () => {
    mockTenantRepo.findByIdWithSettings.mockResolvedValue({
      ...fakeTenant({ id: 1 }),
      settings: fakeTenantSettings(),
    });
    mockUserOnTenantRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.ADMIN,
      status: "ACTIVE",
    });

    await expect(useCase.execute({ tenantId: 1, userId: "user-1" })).rejects.toThrow(
      "Seul un propriétaire peut supprimer le tenant.",
    );
  });

  it("throws when user has no membership", async () => {
    mockTenantRepo.findByIdWithSettings.mockResolvedValue({
      ...fakeTenant({ id: 1 }),
      settings: fakeTenantSettings(),
    });
    mockUserOnTenantRepo.findMembership.mockResolvedValue(null);

    await expect(useCase.execute({ tenantId: 1, userId: "user-1" })).rejects.toThrow(
      "Seul un propriétaire peut supprimer le tenant.",
    );
  });

  it("continues when DNS removal fails (non-blocking)", async () => {
    const tenant = {
      ...fakeTenant({ id: 1 }),
      settings: fakeTenantSettings({ subdomain: "test", customDomain: null }),
    };
    mockTenantRepo.findByIdWithSettings.mockResolvedValue(tenant);
    mockUserOnTenantRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.OWNER,
      status: "ACTIVE",
    });
    mockTenantRepo.update.mockResolvedValue({});
    mockRemoveDomain.mockResolvedValue(undefined);
    mockRemoveRecord.mockRejectedValue(new Error("DNS error"));

    await expect(useCase.execute({ tenantId: 1, userId: "user-1" })).resolves.toBeUndefined();
  });

  it("does not delete org (deferred - tenant is soft-deleted, FK prevents it)", async () => {
    const orgId = 42;
    const tenant = {
      ...fakeTenant({ id: 1, organizationId: orgId }),
      settings: fakeTenantSettings({ subdomain: "test", customDomain: null }),
    };

    mockTenantRepo.findByIdWithSettings.mockResolvedValue(tenant);
    mockUserOnTenantRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.OWNER,
      status: "ACTIVE",
    });
    mockTenantRepo.update.mockResolvedValue({});
    mockRemoveDomain.mockResolvedValue(undefined);
    mockRemoveRecord.mockResolvedValue(undefined);

    await useCase.execute({ tenantId: 1, userId: "user-1" });

    expect(mockTenantRepo.update).toHaveBeenCalledWith(1, { deletedAt: expect.any(Date) });
  });
});
