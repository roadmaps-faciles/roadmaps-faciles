import { type Session } from "next-auth";

import { fakeOrganization, fakeOrgMember, fakeTenant, fakeTenantSettings } from "../../testi/helpers";

const MOCK_HOST = "http://localhost:3000";

const mockOrgMemberRepo = { findByUserIdWithOrgsAndTenants: vi.fn() };
const mockUserOnTenantRepo = { findByUserIdWithSettings: vi.fn() };
const mockTenantRepo = { findByIdWithSettings: vi.fn() };
const mockOrganizationRepo = { findById: vi.fn() };
const mockPrisma = { organization: { findMany: vi.fn() } };

vi.mock("@/config", () => ({
  config: {
    host: MOCK_HOST,
    espaceMembre: { url: "https://espace-membre.incubateur.net" },
  },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

vi.mock("@/lib/repo", () => ({
  orgMemberRepo: mockOrgMemberRepo,
  userOnTenantRepo: mockUserOnTenantRepo,
  tenantRepo: mockTenantRepo,
  organizationRepo: mockOrganizationRepo,
}));

const { getUserMenuContext } = await import("@/utils/userMenuContext");

function makeSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    expires: new Date(Date.now() + 86400_000).toISOString(),
    user: {
      uuid: "user-1",
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      isSuperAdmin: false,
      ...overrides,
    },
  } as Session;
}

function makeOrgWithTenants(
  orgOverrides = {},
  tenants: Array<{ settings?: Record<string, unknown> } & Record<string, unknown>> = [],
) {
  const org = fakeOrganization(orgOverrides);
  return {
    ...org,
    tenants: tenants.map(t => {
      const tenant = fakeTenant({ organizationId: org.id, ...t });
      return { ...tenant, settings: t.settings ? fakeTenantSettings({ tenantId: tenant.id, ...t.settings }) : null };
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockOrgMemberRepo.findByUserIdWithOrgsAndTenants.mockResolvedValue([]);
  mockUserOnTenantRepo.findByUserIdWithSettings.mockResolvedValue([]);
  mockPrisma.organization.findMany.mockResolvedValue([]);
});

describe("getUserMenuContext", () => {
  it("returns empty data when session has no uuid", async () => {
    const result = await getUserMenuContext({ session: { expires: "", user: {} } as Session });
    expect(result.organizations).toEqual([]);
    expect(result.user.email).toBe("");
  });

  describe("organizations - normal user", () => {
    it("exposes org with orgAdminHref when role is OWNER", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, [
        { id: 10, settings: { name: "Espace 1", subdomain: "espace-1" } },
      ]);
      mockOrgMemberRepo.findByUserIdWithOrgsAndTenants.mockResolvedValue([
        { ...fakeOrgMember({ organizationId: 1, userId: "user-1", role: "OWNER" }), organization: org },
      ]);
      mockUserOnTenantRepo.findByUserIdWithSettings.mockResolvedValue([{ tenantId: 10, role: "OWNER" }]);

      const result = await getUserMenuContext({ session: makeSession() });

      expect(result.organizations).toHaveLength(1);
      expect(result.organizations[0]).toMatchObject({ name: "Acme", slug: "acme", role: "OWNER" });
      expect(result.organizations[0].orgAdminHref).toBeDefined();
      expect(result.organizations[0].tenants).toHaveLength(1);
      expect(result.organizations[0].tenants[0]).toMatchObject({ name: "Espace 1", subdomain: "espace-1" });
    });

    it("hides orgAdminHref when role is MEMBER", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, [
        { id: 10, settings: { name: "Espace 1", subdomain: "espace-1" } },
      ]);
      mockOrgMemberRepo.findByUserIdWithOrgsAndTenants.mockResolvedValue([
        { ...fakeOrgMember({ organizationId: 1, userId: "user-1", role: "MEMBER" }), organization: org },
      ]);
      mockUserOnTenantRepo.findByUserIdWithSettings.mockResolvedValue([{ tenantId: 10, role: "USER" }]);

      const result = await getUserMenuContext({ session: makeSession() });

      expect(result.organizations).toHaveLength(1);
      expect(result.organizations[0].role).toBe("MEMBER");
      expect(result.organizations[0].orgAdminHref).toBeUndefined();
      expect(result.organizations[0].tenants).toHaveLength(1);
    });

    it("exposes orgAdminHref when role is ADMIN", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, []);
      mockOrgMemberRepo.findByUserIdWithOrgsAndTenants.mockResolvedValue([
        { ...fakeOrgMember({ organizationId: 1, userId: "user-1", role: "ADMIN" }), organization: org },
      ]);

      const result = await getUserMenuContext({ session: makeSession() });

      expect(result.organizations).toHaveLength(1);
      expect(result.organizations[0].orgAdminHref).toBeDefined();
    });

    it("tracks currentTenantId and exposes currentTenant context", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, [
        { id: 10, settings: { name: "E1", subdomain: "e1" } },
        { id: 20, settings: { name: "E2", subdomain: "e2" } },
      ]);
      mockOrgMemberRepo.findByUserIdWithOrgsAndTenants.mockResolvedValue([
        { ...fakeOrgMember({ organizationId: 1, userId: "user-1", role: "OWNER" }), organization: org },
      ]);
      mockUserOnTenantRepo.findByUserIdWithSettings.mockResolvedValue([
        { tenantId: 10, role: "USER" },
        { tenantId: 20, role: "USER" },
      ]);

      const result = await getUserMenuContext({ session: makeSession(), currentTenantId: 20 });

      expect(result.currentTenantId).toBe(20);
      expect(result.currentTenant).toMatchObject({ name: "E2" });
    });

    it("sets tenant subdomain", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, [
        { id: 10, settings: { name: "Mon Espace", subdomain: "mon-espace" } },
      ]);
      mockOrgMemberRepo.findByUserIdWithOrgsAndTenants.mockResolvedValue([
        { ...fakeOrgMember({ organizationId: 1, userId: "user-1", role: "OWNER" }), organization: org },
      ]);
      mockUserOnTenantRepo.findByUserIdWithSettings.mockResolvedValue([{ tenantId: 10, role: "USER" }]);

      const result = await getUserMenuContext({ session: makeSession() });

      expect(result.organizations[0].tenants[0].subdomain).toBe("mon-espace");
    });
  });

  describe("organizations - super admin", () => {
    it("loads all orgs via prisma, not just memberships", async () => {
      const org1 = makeOrgWithTenants({ id: 1, name: "Org A", slug: "org-a" }, [
        { id: 10, settings: { name: "T1", subdomain: "t1" } },
      ]);
      const org2 = makeOrgWithTenants({ id: 2, name: "Org B", slug: "org-b" }, [
        { id: 20, settings: { name: "T2", subdomain: "t2" } },
      ]);
      mockPrisma.organization.findMany.mockResolvedValue([org1, org2]);

      const result = await getUserMenuContext({ session: makeSession({ isSuperAdmin: true }) });

      expect(mockPrisma.organization.findMany).toHaveBeenCalled();
      expect(mockOrgMemberRepo.findByUserIdWithOrgsAndTenants).toHaveBeenCalled();
      expect(result.organizations).toHaveLength(2);
      expect(result.organizations.flatMap(o => o.tenants)).toHaveLength(2);
    });

    it("sets effective OWNER role on all orgs", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, []);
      mockPrisma.organization.findMany.mockResolvedValue([org]);

      const result = await getUserMenuContext({ session: makeSession({ isSuperAdmin: true }) });

      expect(result.organizations[0].role).toBe("OWNER");
    });

    it("preserves actual tenant role when super admin is member", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, [
        { id: 10, settings: { name: "T1", subdomain: "t1" } },
      ]);
      mockPrisma.organization.findMany.mockResolvedValue([org]);
      mockUserOnTenantRepo.findByUserIdWithSettings.mockResolvedValue([{ tenantId: 10, role: "MODERATOR" }]);

      const result = await getUserMenuContext({ session: makeSession({ isSuperAdmin: true }) });

      expect(result.organizations[0].tenants[0].role).toBe("MODERATOR");
    });

    it("defaults tenant role to OWNER when super admin has no membership", async () => {
      const org = makeOrgWithTenants({ id: 1, name: "Acme", slug: "acme" }, [
        { id: 10, settings: { name: "T1", subdomain: "t1" } },
      ]);
      mockPrisma.organization.findMany.mockResolvedValue([org]);

      const result = await getUserMenuContext({ session: makeSession({ isSuperAdmin: true }) });

      expect(result.organizations[0].tenants[0].role).toBe("OWNER");
    });

    it("sets isSuperAdmin flag on result", async () => {
      mockPrisma.organization.findMany.mockResolvedValue([]);
      const result = await getUserMenuContext({ session: makeSession({ isSuperAdmin: true }) });
      expect(result.isSuperAdmin).toBe(true);
    });
  });

  describe("user data", () => {
    it("propagates user image from session", async () => {
      const result = await getUserMenuContext({
        session: makeSession({ image: "/avatars/test.jpg" }),
      });
      expect(result.user.image).toBe("/avatars/test.jpg");
    });
  });
});
