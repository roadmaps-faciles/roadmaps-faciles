import { CreateNewTenant } from "@/useCases/tenant/CreateNewTenant";

import {
  type createMockInvitationRepo as CreateMockInvitationRepo,
  type createMockOrgMemberRepo as CreateMockOrgMemberRepo,
  type createMockOrganizationRepo as CreateMockOrganizationRepo,
  type createMockTenantRepo as CreateMockTenantRepo,
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  type createMockUserOnTenantRepo as CreateMockUserOnTenantRepo,
  type createMockUserRepo as CreateMockUserRepo,
  createMockInvitationRepo,
  createMockOrgMemberRepo,
  createMockOrganizationRepo,
  createMockTenantRepo,
  createMockTenantSettingsRepo,
  createMockUserOnTenantRepo,
  createMockUserRepo,
  fakeOrganization,
  fakeTenant,
  fakeTenantSettings,
} from "../helpers";

// Mock des providers externes
const mockAddDomain = vi.fn();
vi.mock("@/lib/ee/domain-provider", () => ({
  getDomainProvider: () => ({ addDomain: mockAddDomain }),
}));

const mockAddRecord = vi.fn();
vi.mock("@/lib/ee/dns-provider", () => ({
  getDnsProvider: () => ({ addRecord: mockAddRecord }),
}));

// Mock SendInvitation avec une vraie classe (nécessaire pour `new`)
const mockSendInvitationExecute = vi.fn();
vi.mock("@/useCases/invitations/SendInvitation", () => ({
  SendInvitation: class {
    public execute = mockSendInvitationExecute;
  },
}));

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
    host: "http://localhost:3000",
  },
}));

const mockCanCreateTenant = vi.fn().mockResolvedValue(true);
vi.mock("@/lib/ee/entitlements", () => ({
  canCreateTenant: (...args: unknown[]) => mockCanCreateTenant(...args),
}));

// Mock prisma for the transaction-based org entitlement check
const mockTx = {
  $queryRaw: vi.fn().mockResolvedValue([]),
  organization: { findUnique: vi.fn() },
  tenant: { count: vi.fn(), create: vi.fn() },
};
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
  },
}));

describe("CreateNewTenant", () => {
  let mockTenantRepo: ReturnType<typeof CreateMockTenantRepo>;
  let mockSettingsRepo: ReturnType<typeof CreateMockTenantSettingsRepo>;
  let mockInvitationRepo: ReturnType<typeof CreateMockInvitationRepo>;
  let mockUserOnTenantRepo: ReturnType<typeof CreateMockUserOnTenantRepo>;
  let mockUserRepo: ReturnType<typeof CreateMockUserRepo>;
  let mockOrganizationRepo: ReturnType<typeof CreateMockOrganizationRepo>;
  let mockOrgMemberRepo: ReturnType<typeof CreateMockOrgMemberRepo>;
  let useCase: CreateNewTenant;

  beforeEach(() => {
    mockTenantRepo = createMockTenantRepo();
    mockSettingsRepo = createMockTenantSettingsRepo();
    mockInvitationRepo = createMockInvitationRepo();
    mockUserOnTenantRepo = createMockUserOnTenantRepo();
    mockUserRepo = createMockUserRepo();
    mockOrganizationRepo = createMockOrganizationRepo();
    mockOrgMemberRepo = createMockOrgMemberRepo();
    useCase = new CreateNewTenant(
      mockTenantRepo,
      mockSettingsRepo,
      mockInvitationRepo,
      mockUserOnTenantRepo,
      mockUserRepo,
      mockOrganizationRepo,
      mockOrgMemberRepo,
    );
    mockAddDomain.mockReset();
    mockAddRecord.mockReset();
    mockSendInvitationExecute.mockReset();
    mockTx.$queryRaw.mockReset().mockResolvedValue([]);
    mockTx.organization.findUnique.mockReset();
    mockTx.tenant.count.mockReset();
    mockTx.tenant.create.mockReset();
    // Default: org creation succeeds
    mockOrganizationRepo.create.mockResolvedValue(fakeOrganization({ id: 100 }));
    mockOrgMemberRepo.create.mockResolvedValue({});
    // Default: findById returns a fake tenant (for post-creation fetch)
    mockTenantRepo.findById.mockImplementation((id: number) => Promise.resolve(fakeTenant({ id })));
  });

  it("creates a tenant with settings and provisions domain/DNS", async () => {
    const org = fakeOrganization({ id: 10 });
    const tenant = fakeTenant({ id: 1, organizationId: 10 });
    const settings = fakeTenantSettings({ tenantId: 1, name: "Test", subdomain: "my-test" });

    mockOrganizationRepo.create.mockResolvedValue(org);
    mockTenantRepo.create.mockResolvedValue(tenant);
    mockTenantRepo.findById.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockOrgMemberRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({ type: "CNAME", name: "my-test" });
    mockSendInvitationExecute.mockResolvedValue({});

    const result = await useCase.execute({
      name: "Test",
      subdomain: "my-test",
      creatorId: "user-1",
      ownerEmails: ["owner@test.com"],
    });

    expect(mockOrganizationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test", slug: "my-test", plan: "BASE" }),
    );
    expect(mockTenantRepo.create).toHaveBeenCalledWith({ organizationId: 10 });
    expect(mockSettingsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 1, name: "Test", subdomain: "my-test" }),
    );
    expect(mockAddDomain).toHaveBeenCalledWith("my-test.localhost:3000", "subdomain");
    expect(mockAddRecord).toHaveBeenCalledWith("my-test");
    expect(result.tenant).toEqual({ ...tenant, settings });
    expect(result.dns).toEqual({ type: "CNAME", name: "my-test" });
    expect(result.organization).toEqual({ id: 10 });
  });

  it("continues when DNS provisioning fails (non-blocking)", async () => {
    const tenant = fakeTenant({ id: 2 });
    const settings = fakeTenantSettings({ tenantId: 2, name: "Test2", subdomain: "test2" });

    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockRejectedValue(new Error("DNS provider error"));
    mockSendInvitationExecute.mockResolvedValue({});

    const result = await useCase.execute({
      name: "Test2",
      subdomain: "test2",
      creatorId: "user-1",
      ownerEmails: ["owner@test.com"],
    });

    expect(result.dns).toBeUndefined();
    expect(result.tenant).toBeDefined();
  });

  it("sends invitations to all owner emails", async () => {
    const tenant = fakeTenant({ id: 3 });
    const settings = fakeTenantSettings({ tenantId: 3, subdomain: "multi" });

    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute.mockResolvedValue({});

    await useCase.execute({
      name: "Multi",
      subdomain: "multi",
      creatorId: "user-1",
      ownerEmails: ["owner1@test.com", "owner2@test.com"],
    });

    expect(mockSendInvitationExecute).toHaveBeenCalledTimes(2);
    expect(mockSendInvitationExecute).toHaveBeenCalledWith(
      expect.objectContaining({ email: "owner1@test.com", role: "OWNER" }),
    );
    expect(mockSendInvitationExecute).toHaveBeenCalledWith(
      expect.objectContaining({ email: "owner2@test.com", role: "OWNER" }),
    );
  });

  it("continues when an owner invitation fails (e.g., already a member)", async () => {
    const tenant = fakeTenant({ id: 5 });
    const settings = fakeTenantSettings({ tenantId: 5, subdomain: "dup" });

    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute
      .mockRejectedValueOnce(new Error("Cet utilisateur est déjà membre de ce tenant."))
      .mockResolvedValueOnce({});

    const result = await useCase.execute({
      name: "Dup",
      subdomain: "dup",
      creatorId: "user-1",
      ownerEmails: ["already-member@test.com", "new-owner@test.com"],
    });

    expect(result.tenant).toBeDefined();
    expect(mockSendInvitationExecute).toHaveBeenCalledTimes(2);
    expect(result.failedInvitations).toEqual([
      { email: "already-member@test.com", reason: "Cet utilisateur est déjà membre de ce tenant." },
    ]);
  });

  it("does not include failedInvitations when all succeed", async () => {
    const tenant = fakeTenant({ id: 6 });
    const settings = fakeTenantSettings({ tenantId: 6, subdomain: "ok" });

    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute.mockResolvedValue({});

    const result = await useCase.execute({
      name: "Ok",
      subdomain: "ok",
      creatorId: "user-1",
      ownerEmails: ["owner@test.com"],
    });

    expect(result.failedInvitations).toBeUndefined();
  });

  it("passes tenant locale to invitation emails", async () => {
    const tenant = fakeTenant({ id: 7 });
    const settings = fakeTenantSettings({ tenantId: 7, subdomain: "en-tenant", locale: "en" });

    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute.mockResolvedValue({});

    await useCase.execute({
      name: "EN Tenant",
      subdomain: "en-tenant",
      creatorId: "user-1",
      ownerEmails: ["owner@test.com"],
    });

    expect(mockSendInvitationExecute).toHaveBeenCalledWith(expect.objectContaining({ locale: "en" }));
  });

  it("creates OWNER membership for the creator", async () => {
    const org = fakeOrganization({ id: 50 });
    const tenant = fakeTenant({ id: 4, organizationId: 50 });
    const settings = fakeTenantSettings({ tenantId: 4, subdomain: "owned" });

    mockOrganizationRepo.create.mockResolvedValue(org);
    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockOrgMemberRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute.mockResolvedValue({});

    await useCase.execute({
      name: "Owned",
      subdomain: "owned",
      creatorId: "creator-uuid",
      ownerEmails: ["owner@test.com"],
    });

    expect(mockUserOnTenantRepo.create).toHaveBeenCalledWith({
      userId: "creator-uuid",
      tenantId: 4,
      role: "OWNER",
      status: "ACTIVE",
    });
    expect(mockOrgMemberRepo.create).toHaveBeenCalledWith({
      organizationId: 50,
      userId: "creator-uuid",
      role: "OWNER",
    });
  });

  it("skips org creation when organizationId is provided", async () => {
    const org = fakeOrganization({ id: 42, plan: "GRANTED_FREE" });
    const tenant = fakeTenant({ id: 9, organizationId: 42 });
    const settings = fakeTenantSettings({ tenantId: 9, subdomain: "existing-org" });

    // Mock prisma transaction internals
    mockTx.organization.findUnique.mockResolvedValue(org);
    mockTx.tenant.count.mockResolvedValue(1);
    mockTx.tenant.create.mockResolvedValue(tenant);

    // Mock repo for post-transaction findById
    mockTenantRepo.findById.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute.mockResolvedValue({});

    const result = await useCase.execute({
      name: "ExistingOrg",
      subdomain: "existing-org",
      creatorId: "user-org",
      ownerEmails: [],
      organizationId: 42,
    });

    expect(mockOrganizationRepo.create).not.toHaveBeenCalled();
    expect(mockOrgMemberRepo.create).not.toHaveBeenCalled();
    expect(result.organization).toEqual({ id: 42 });
  });

  it("throws TENANT_LIMIT_REACHED when org lacks MULTI_TENANT addon", async () => {
    const org = fakeOrganization({ id: 42, plan: "BASE" });
    mockTx.organization.findUnique.mockResolvedValue(org);
    mockTx.tenant.count.mockResolvedValue(1);
    mockCanCreateTenant.mockResolvedValueOnce(false);

    await expect(
      useCase.execute({
        name: "Second Tenant",
        subdomain: "second",
        creatorId: "user-1",
        ownerEmails: [],
        organizationId: 42,
      }),
    ).rejects.toThrow("TENANT_LIMIT_REACHED");

    expect(mockTx.tenant.create).not.toHaveBeenCalled();
  });

  it("creates an Organization linked to the tenant", async () => {
    const org = fakeOrganization({ id: 77 });
    const tenant = fakeTenant({ id: 8, organizationId: 77 });
    const settings = fakeTenantSettings({ tenantId: 8, subdomain: "org-test" });

    mockOrganizationRepo.create.mockResolvedValue(org);
    mockTenantRepo.create.mockResolvedValue(tenant);
    mockSettingsRepo.create.mockResolvedValue(settings);
    mockUserOnTenantRepo.create.mockResolvedValue({});
    mockOrgMemberRepo.create.mockResolvedValue({});
    mockAddDomain.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue({});
    mockSendInvitationExecute.mockResolvedValue({});

    const result = await useCase.execute({
      name: "OrgTest",
      subdomain: "org-test",
      creatorId: "user-org",
      ownerEmails: [],
    });

    expect(mockOrganizationRepo.create).toHaveBeenCalledWith({
      name: "OrgTest",
      slug: "org-test",
      plan: "BASE",
    });
    expect(mockTenantRepo.create).toHaveBeenCalledWith({ organizationId: 77 });
    expect(result.organization).toEqual({ id: 77 });
  });
});
