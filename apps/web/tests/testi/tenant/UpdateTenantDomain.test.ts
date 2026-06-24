import { UpdateTenantDomain } from "@/useCases/tenant/UpdateTenantDomain";

import {
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  createMockTenantSettingsRepo,
  fakeTenantSettings,
} from "../helpers";

const mockFindFirst = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tenantSettings: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
  },
}));

vi.mock("@/lib/ee/domain-verification", () => ({
  generateVerificationToken: () => "roadmaps-faciles-verify=testtoken",
}));

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
  let useCase: UpdateTenantDomain;

  beforeEach(() => {
    mockSettingsRepo = createMockTenantSettingsRepo();
    useCase = new UpdateTenantDomain(mockSettingsRepo);
    mockFindFirst.mockReset();
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

  it("registers a new custom domain as unverified with a TXT token", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "sub", customDomain: "old.com" });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockFindFirst.mockResolvedValue(null); // no conflict
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ customDomain: "new.com" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, customDomain: "new.com" });

    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBe("new.com");
    expect(updateData.customDomainVerificationToken).toBe("roadmaps-faciles-verify=testtoken");
    expect(updateData.customDomainVerifiedAt).toBeNull();
    expect(mockRemoveDomain).toHaveBeenCalledWith("old.com");
    expect(mockAddDomain).toHaveBeenCalledWith("new.com", "custom");
  });

  it("clears domain + token + verification when the custom domain is removed", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "sub", customDomain: "old.com" });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ customDomain: null }));
    mockRemoveDomain.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, customDomain: null });

    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBeNull();
    expect(updateData.customDomainVerificationToken).toBeNull();
    expect(updateData.customDomainVerifiedAt).toBeNull();
    expect(mockRemoveDomain).toHaveBeenCalledWith("old.com");
  });

  it("does not re-issue a token nor reset verification when the custom domain is unchanged", async () => {
    const existing = fakeTenantSettings({ id: 1, subdomain: "old", customDomain: "legacy.com" });
    mockSettingsRepo.findById.mockResolvedValue(existing);
    mockFindFirst.mockResolvedValue(null);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ subdomain: "new", customDomain: "legacy.com" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);
    mockRemoveRecord.mockResolvedValue(undefined);
    mockAddRecord.mockResolvedValue(undefined);

    // Only the subdomain changes; customDomain stays "legacy.com" → no token/verification churn.
    await useCase.execute({ settingsId: 1, subdomain: "new", customDomain: "legacy.com" });

    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBeUndefined();
    expect(updateData.customDomainVerificationToken).toBeUndefined();
    expect(updateData.customDomainVerifiedAt).toBeUndefined();
  });

  it("throws when custom domain conflicts", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, customDomain: null }));
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

  it("allows switching between .gouv.fr domains while the DSFR theme is active (re-issues token, unverified)", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({ id: 1, uiTheme: "Dsfr", customDomain: "old.gouv.fr" }),
    );
    mockFindFirst.mockResolvedValue(null);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ customDomain: "new.gouv.fr" }));
    mockRemoveDomain.mockResolvedValue(undefined);
    mockAddDomain.mockResolvedValue(undefined);

    await useCase.execute({ settingsId: 1, customDomain: "new.gouv.fr" });

    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomain).toBe("new.gouv.fr");
    expect(updateData.customDomainVerificationToken).toBe("roadmaps-faciles-verify=testtoken");
    expect(updateData.customDomainVerifiedAt).toBeNull();
    expect(mockAddDomain).toHaveBeenCalledWith("new.gouv.fr", "custom");
  });
});
