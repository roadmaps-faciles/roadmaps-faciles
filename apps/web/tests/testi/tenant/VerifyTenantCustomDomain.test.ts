import { VerifyTenantCustomDomain } from "@/useCases/tenant/VerifyTenantCustomDomain";

import {
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  createMockTenantSettingsRepo,
  fakeTenantSettings,
} from "../helpers";

const mockVerifyDomainTxt = vi.fn();
vi.mock("@/lib/ee/domain-verification", () => ({
  verifyDomainTxt: (...args: unknown[]) => mockVerifyDomainTxt(...args),
}));

describe("VerifyTenantCustomDomain", () => {
  let mockSettingsRepo: ReturnType<typeof CreateMockTenantSettingsRepo>;
  let useCase: VerifyTenantCustomDomain;

  beforeEach(() => {
    mockSettingsRepo = createMockTenantSettingsRepo();
    useCase = new VerifyTenantCustomDomain(mockSettingsRepo);
    mockVerifyDomainTxt.mockReset();
  });

  it("throws when settings are not found", async () => {
    mockSettingsRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ settingsId: 1 })).rejects.toThrow("Configuration du tenant introuvable.");
  });

  it("throws when there is no custom domain or token to verify", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({ id: 1, customDomain: null, customDomainVerificationToken: null }),
    );
    await expect(useCase.execute({ settingsId: 1 })).rejects.toThrow("Aucun domaine personnalisé à vérifier.");
  });

  it("marks verifiedAt when the TXT record matches", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({
        id: 1,
        customDomain: "feedback.example.com",
        customDomainVerificationToken: "roadmaps-faciles-verify=abc",
        customDomainVerifiedAt: null,
      }),
    );
    mockVerifyDomainTxt.mockResolvedValue(true);
    mockSettingsRepo.update.mockResolvedValue(fakeTenantSettings({ id: 1 }));

    const result = await useCase.execute({ settingsId: 1 });

    expect(mockVerifyDomainTxt).toHaveBeenCalledWith("feedback.example.com", "roadmaps-faciles-verify=abc");
    expect(result.verified).toBe(true);
    const [, updateData] = mockSettingsRepo.update.mock.calls[0];
    expect(updateData.customDomainVerifiedAt).toBeInstanceOf(Date);
  });

  it("does not update when the TXT record is missing", async () => {
    mockSettingsRepo.findById.mockResolvedValue(
      fakeTenantSettings({
        id: 1,
        customDomain: "feedback.example.com",
        customDomainVerificationToken: "roadmaps-faciles-verify=abc",
        customDomainVerifiedAt: null,
      }),
    );
    mockVerifyDomainTxt.mockResolvedValue(false);

    const result = await useCase.execute({ settingsId: 1 });

    expect(result.verified).toBe(false);
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });
});
