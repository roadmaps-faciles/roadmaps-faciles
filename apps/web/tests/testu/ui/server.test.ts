import { getTheme } from "@/ui/server";

describe("getTheme", () => {
  it('returns "Default" when settings is null', async () => {
    expect(await getTheme(null)).toBe("Default");
  });

  it('returns "Default" when settings is undefined', async () => {
    expect(await getTheme(undefined)).toBe("Default");
  });

  it('returns "Default" when uiTheme is "Default"', async () => {
    expect(await getTheme({ uiTheme: "Default" })).toBe("Default");
  });

  it('returns "Dsfr" when uiTheme is "Dsfr"', async () => {
    expect(await getTheme({ uiTheme: "Dsfr" })).toBe("Dsfr");
  });
});
