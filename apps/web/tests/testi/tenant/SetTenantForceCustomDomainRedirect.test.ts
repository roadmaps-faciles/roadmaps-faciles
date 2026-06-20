import { SetTenantForceCustomDomainRedirect } from "@/useCases/tenant/SetTenantForceCustomDomainRedirect";

import {
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  createMockTenantSettingsRepo,
  fakeTenantSettings,
} from "../helpers";

describe("SetTenantForceCustomDomainRedirect", () => {
  let mockSettingsRepo: ReturnType<typeof CreateMockTenantSettingsRepo>;
  let useCase: SetTenantForceCustomDomainRedirect;

  beforeEach(() => {
    mockSettingsRepo = createMockTenantSettingsRepo();
    useCase = new SetTenantForceCustomDomainRedirect(mockSettingsRepo);
  });

  it("enables the redirect when a custom domain is configured", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, customDomain: "feedback.acme.com" }));
    mockSettingsRepo.update.mockResolvedValue(
      fakeTenantSettings({ id: 1, customDomain: "feedback.acme.com", forceCustomDomainRedirect: true }),
    );

    const result = await useCase.execute({ settingsId: 1, forceCustomDomainRedirect: true });

    expect(result.forceCustomDomainRedirect).toBe(true);
    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, { forceCustomDomainRedirect: true });
  });

  it("rejects enabling the redirect when no custom domain is configured", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, customDomain: null }));

    await expect(useCase.execute({ settingsId: 1, forceCustomDomainRedirect: true })).rejects.toThrow(
      "Un domaine personnalisé doit être configuré avant d'activer la redirection canonique.",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });

  it("allows disabling the redirect even without a custom domain", async () => {
    mockSettingsRepo.findById.mockResolvedValue(fakeTenantSettings({ id: 1, customDomain: null }));
    mockSettingsRepo.update.mockResolvedValue(
      fakeTenantSettings({ id: 1, customDomain: null, forceCustomDomainRedirect: false }),
    );

    const result = await useCase.execute({ settingsId: 1, forceCustomDomainRedirect: false });

    expect(result.forceCustomDomainRedirect).toBe(false);
    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, { forceCustomDomainRedirect: false });
  });

  it("throws when the settings are not found", async () => {
    mockSettingsRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ settingsId: 999, forceCustomDomainRedirect: true })).rejects.toThrow(
      "Configuration du tenant introuvable.",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });
});
