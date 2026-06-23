import { UpdateTenantDomain } from "@/useCases/tenant/UpdateTenantDomain";

import {
  type createMockOrgDomainRepo as CreateMockOrgDomainRepo,
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  createMockOrgDomainRepo,
  createMockTenantSettingsRepo,
  fakeTenantSettings,
} from "../helpers";

const mockFindFirst = vi.fn();
const mockTenantFindUnique = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tenantSettings: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    tenant: { findUnique: (...args: unknown[]) => mockTenantFindUnique(...args) },
  },
}));

const verifiedOrgDomain = (domain: string) => ({
  id: 1,
  organizationId: 42,
  domain,
  verificationToken: "tok",
  verifiedAt: new Date(),
  isGouv: domain.endsWith(".gouv.fr"),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockAddDomain = vi.fn();
const mockRemoveDomain = vi.fn();
vi.mock("@/lib/ee/domain-provider", () => ({
  getDomainProvider: () => ({ addDomain: mockAddDomain, removeDomain: mockRemoveDomain }),
}));

const mockAddRecord = vi.fn();
const mockRemoveRecord = vi.fn();
vi.mock("@/lib/ee/dns-provider", () => ({
  getDnsProvider: () => ({ addRecord: mockAddRecord, removeRecord: mockRemoveRecord }),
}));

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
    host: "http://localhost:3000",
  },
}));

describe("UpdateTenantDomain", () => {
  let mockSettingsRepo: ReturnType<typeof CreateMockTenantSettingsRepo>;
  let mockOrgDomainRepo: ReturnType<typeof CreateMockOrgDomainRepo>;
  let useCase: UpdateTenantDomain;

  beforeEach(() => {
    mockSettingsRepo = createMockTenantSettingsRepo();
    mockOrgDomainRepo = createMockOrgDomainRepo();
    useCase = new UpdateTenantDomain(mockSettingsRepo, mockOrgDomainRepo);
    mockFindFirst.mockReset();
    mockTenantFindUnique.mockReset();
    mockTenantFindUnique.mockResolvedValue({ organizationId: 42 });
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([]);
    mockAddDomain.mockReset();
    mockRemoveDomain.mockReset();
    mockAddRecord.mockReset();
    mockRemoveRecord.mockReset();
  });

  it("updates subdomain with domain/DNS provisioning", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "old", customDomain: null });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockFindFirst.mockResolvedValue(null); // no conflict
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ subdomain: "new" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);
    mockRemoveRecord.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, subdomain: "new" });

    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, { subdomain: "new" });
    expect(mockRemoveDomain).toHaveBeenCalledWith("old.localhost:3000");
    expect(mockAddDomain).toHaveBeenCalledWith("new.localhost:3000", "subdomain");
    expect(mockRemoveRecord).toHaveBeenCalledWith("old");
    expect(mockAddRecord).toHaveBeenCalledWith("new");
  });

  it("throws when settings are not found", async () => {
    mockSettingsRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ settingsId: 999 })).rejects.toThrow("Configuration du tenant introuvable.");
  });

  it("throws when subdomain conflicts with another tenant", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, subdomain: "old" }));
    mockFindFirst.mockResolvedValue({ id: 2 }); // conflict

    await expect(useCase.execute({ settingsId: 1, subdomain: "taken" })).rejects.toThrow(
      "Ce sous-domaine est déjà utilisé par un autre tenant.",
    );
  });

  it("updates custom domain when covered by a verified org domain", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "sub", customDomain: "old.com" });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockFindFirst.mockResolvedValue(null); // no conflict
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([verifiedOrgDomain("new.com")]);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ customDomain: "new.com" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, customDomain: "new.com" });

    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBe("new.com");
    expect(updateData.customDomainVerifiedAt).toBeInstanceOf(Date);
    expect(mockRemoveDomain).toHaveBeenCalledWith("old.com");
    expect(mockAddDomain).toHaveBeenCalledWith("new.com", "custom");
  });

  it("updates custom domain when covered by a verified parent org domain", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "sub", customDomain: null });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockFindFirst.mockResolvedValue(null);
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([verifiedOrgDomain("ademe.gouv.fr")]);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ customDomain: "roadmaps.ademe.gouv.fr" }));
    mockAddDomain.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, customDomain: "roadmaps.ademe.gouv.fr" });

    expect(mockAddDomain).toHaveBeenCalledWith("roadmaps.ademe.gouv.fr", "custom");
  });

  it("rejects a custom domain not covered by any verified org domain", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, customDomain: null }));
    mockFindFirst.mockResolvedValue(null);
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([]);

    await expect(useCase.execute({ settingsId: 1, customDomain: "evil.com" })).rejects.toThrow(
      "doit d'abord être vérifié au niveau de l'organisation",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });

  it("rejects a custom domain covered only by an UNVERIFIED org domain", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, customDomain: null }));
    mockFindFirst.mockResolvedValue(null);
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([{ ...verifiedOrgDomain("evil.com"), verifiedAt: null }]);

    await expect(useCase.execute({ settingsId: 1, customDomain: "evil.com" })).rejects.toThrow(
      "doit d'abord être vérifié au niveau de l'organisation",
    );
  });

  it("does not re-check coverage when the custom domain is unchanged (grandfathered re-save)", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "old", customDomain: "legacy.com" });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockFindFirst.mockResolvedValue(null);
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([]); // no covering domain
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ subdomain: "new", customDomain: "legacy.com" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);
    mockRemoveRecord.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue(undefined);

    // Only the subdomain changes; customDomain stays "legacy.com" → coverage gate must be skipped.
    await useCase.execute({ settingsId: 1, subdomain: "new", customDomain: "legacy.com" });

    expect(mockOrgDomainRepo.findByOrgId).not.toHaveBeenCalled();
    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBeUndefined();
    expect(updateData.customDomainVerifiedAt).toBeUndefined();
  });

  it("throws when custom domain conflicts", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1 }));
    mockFindFirst.mockResolvedValue({ id: 2 }); // conflict

    await expect(useCase.execute({ settingsId: 1, customDomain: "taken.com" })).rejects.toThrow(
      "Ce domaine personnalisé est déjà utilisé par un autre tenant.",
    );
  });

  it("blocks removing the custom domain while the DSFR theme is active", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({ id: 1, uiTheme: "Dsfr", customDomain: "feedback.gouv.fr" }),
    );

    await expect(useCase.execute({ settingsId: 1, customDomain: null })).rejects.toThrow(
      "Le thème DSFR requiert un domaine .gouv.fr",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });

  it("blocks switching to a non-.gouv.fr domain while the DSFR theme is active", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({ id: 1, uiTheme: "Dsfr", customDomain: "feedback.gouv.fr" }),
    );

    await expect(useCase.execute({ settingsId: 1, customDomain: "feedback.example.com" })).rejects.toThrow(
      "Le thème DSFR requiert un domaine .gouv.fr",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });

  it("allows switching between .gouv.fr domains while the DSFR theme is active", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({ id: 1, uiTheme: "Dsfr", customDomain: "old.gouv.fr" }),
    );
    mockFindFirst.mockResolvedValue(null);
    mockOrgDomainRepo.findByOrgId.mockResolvedValue([verifiedOrgDomain("new.gouv.fr")]);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ customDomain: "new.gouv.fr" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, customDomain: "new.gouv.fr" });

    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBe("new.gouv.fr");
    expect(updateData.customDomainVerifiedAt).toBeInstanceOf(Date);
    expect(mockAddDomain).toHaveBeenCalledWith("new.gouv.fr", "custom");
  });
});
