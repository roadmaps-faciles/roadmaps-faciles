import { uiThemeSchema } from "@/lib/model/TenantSettings";

import { expectZodFailure, expectZodSuccess } from "../validation/_helpers";

describe("uiThemeSchema", () => {
  it('accepts "Default"', () => {
    expect(expectZodSuccess(uiThemeSchema, "Default")).toBe("Default");
  });

  it('accepts "Dsfr"', () => {
    expect(expectZodSuccess(uiThemeSchema, "Dsfr")).toBe("Dsfr");
  });

  it("rejects invalid value", () => {
    expectZodFailure(uiThemeSchema, "invalid");
  });

  it("rejects empty string", () => {
    expectZodFailure(uiThemeSchema, "");
  });

  it("rejects null", () => {
    expectZodFailure(uiThemeSchema, null);
  });
});
