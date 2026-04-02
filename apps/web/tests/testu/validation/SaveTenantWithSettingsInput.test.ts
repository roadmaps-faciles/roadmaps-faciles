import { SaveTenantWithSettingsInput } from "@/useCases/tenant/SaveTenantWithSettings";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("SaveTenantWithSettingsInput schema", () => {
  const valid = {
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

  it("accepts valid data with all fields", () => {
    expectZodSuccess(SaveTenantWithSettingsInput, valid);
  });

  it("accepts allowEmbedding set to true", () => {
    const data = expectZodSuccess(SaveTenantWithSettingsInput, { ...valid, allowEmbedding: true });
    expect(data.allowEmbedding).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...data } = valid;
    expectZodFailure(SaveTenantWithSettingsInput, data);
  });

  it("rejects missing allowEmbedding", () => {
    const { allowEmbedding: _, ...data } = valid;
    expectZodFailure(SaveTenantWithSettingsInput, data);
  });

  it("rejects non-boolean allowEmbedding", () => {
    expectZodFailure(SaveTenantWithSettingsInput, { ...valid, allowEmbedding: "yes" });
  });

  it("rejects missing boolean fields", () => {
    const { isPrivate: _, ...data } = valid;
    expectZodFailure(SaveTenantWithSettingsInput, data);
  });

  it('accepts optional uiTheme set to "Default"', () => {
    const data = expectZodSuccess(SaveTenantWithSettingsInput, { ...valid, uiTheme: "Default" });
    expect(data.uiTheme).toBe("Default");
  });

  it('accepts optional uiTheme set to "Dsfr"', () => {
    const data = expectZodSuccess(SaveTenantWithSettingsInput, { ...valid, uiTheme: "Dsfr" });
    expect(data.uiTheme).toBe("Dsfr");
  });

  it("accepts missing uiTheme (optional)", () => {
    const data = expectZodSuccess(SaveTenantWithSettingsInput, valid);
    expect(data.uiTheme).toBeUndefined();
  });

  it("rejects invalid uiTheme value", () => {
    expectZodFailure(SaveTenantWithSettingsInput, { ...valid, uiTheme: "invalid" });
  });
});
