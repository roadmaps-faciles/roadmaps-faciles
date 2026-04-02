import { SaveTenantWithSettings } from "@/useCases/tenant/SaveTenantWithSettings";

import {
  type createMockTenantSettingsRepo as CreateMockTenantSettingsRepo,
  createMockTenantSettingsRepo,
  fakeTenantSettings,
} from "../helpers";

describe("SaveTenantWithSettings", () => {
  let mockSettingsRepo: ReturnType<typeof CreateMockTenantSettingsRepo>;
  let useCase: SaveTenantWithSettings;

  beforeEach(() => {
    mockSettingsRepo = createMockTenantSettingsRepo();
    useCase = new SaveTenantWithSettings(mockSettingsRepo);
  });

  const validInput = {
    id: 1,
    isPrivate: false,
    allowAnonymousFeedback: true,
    allowPostEdits: false,
    allowPostDeletion: false,
    showRoadmapInHeader: false,
    allowVoting: true,
    allowComments: true,
    allowAnonymousVoting: true,
    requirePostApproval: false,
    allowEmbedding: false,
  };

  it("updates tenant settings successfully", async () => {
    const updated = fakeTenantSettings({ id: 1 });
    mockSettingsRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute(validInput);

    expect(result).toEqual(updated);
    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, {
      isPrivate: false,
      allowAnonymousFeedback: true,
      allowPostEdits: false,
      allowPostDeletion: false,
      showRoadmapInHeader: false,
      allowVoting: true,
      allowComments: true,
      allowAnonymousVoting: true,
      requirePostApproval: false,
      allowEmbedding: false,
    });
  });

  it("passes allowEmbedding=true to repo", async () => {
    const updated = fakeTenantSettings({ id: 1, allowEmbedding: true });
    mockSettingsRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ ...validInput, allowEmbedding: true });

    expect(result.allowEmbedding).toBe(true);
    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ allowEmbedding: true }));
  });

  it("preserves all settings fields when toggling allowEmbedding", async () => {
    const input = { ...validInput, isPrivate: true, allowEmbedding: true };
    const updated = fakeTenantSettings({ id: 1, isPrivate: true, allowEmbedding: true });
    mockSettingsRepo.update.mockResolvedValue(updated);

    await useCase.execute(input);

    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, {
      isPrivate: true,
      allowAnonymousFeedback: true,
      allowPostEdits: false,
      allowPostDeletion: false,
      showRoadmapInHeader: false,
      allowVoting: true,
      allowComments: true,
      allowAnonymousVoting: true,
      requirePostApproval: false,
      allowEmbedding: true,
    });
  });

  it("passes uiTheme Dsfr to repo when tenant has .gouv.fr custom domain", async () => {
    const current = fakeTenantSettings({ id: 1, customDomain: "feedback.gouv.fr" });
    const updated = fakeTenantSettings({ id: 1, uiTheme: "Dsfr", customDomain: "feedback.gouv.fr" });
    mockSettingsRepo.findById.mockResolvedValue(current);
    mockSettingsRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ ...validInput, uiTheme: "Dsfr" });

    expect(result.uiTheme).toBe("Dsfr");
    expect(mockSettingsRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ uiTheme: "Dsfr" }));
  });

  it("rejects uiTheme Dsfr when tenant has no custom domain", async () => {
    const current = fakeTenantSettings({ id: 1, customDomain: null });
    mockSettingsRepo.findById.mockResolvedValue(current);

    await expect(useCase.execute({ ...validInput, uiTheme: "Dsfr" })).rejects.toThrow(
      "DSFR theme requires a .gouv.fr custom domain",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });

  it("rejects uiTheme Dsfr when custom domain is not .gouv.fr", async () => {
    const current = fakeTenantSettings({ id: 1, customDomain: "feedback.example.com" });
    mockSettingsRepo.findById.mockResolvedValue(current);

    await expect(useCase.execute({ ...validInput, uiTheme: "Dsfr" })).rejects.toThrow(
      "DSFR theme requires a .gouv.fr custom domain",
    );
    expect(mockSettingsRepo.update).not.toHaveBeenCalled();
  });

  it("allows uiTheme Default without .gouv.fr domain", async () => {
    const updated = fakeTenantSettings({ id: 1, uiTheme: "Default" });
    mockSettingsRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ ...validInput, uiTheme: "Default" });

    expect(result.uiTheme).toBe("Default");
    expect(mockSettingsRepo.findById).not.toHaveBeenCalled();
  });

  it("does not include uiTheme in repo call when omitted", async () => {
    const updated = fakeTenantSettings({ id: 1 });
    mockSettingsRepo.update.mockResolvedValue(updated);

    await useCase.execute(validInput);

    const updateCall = mockSettingsRepo.update.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(updateCall).not.toHaveProperty("uiTheme");
  });
});
