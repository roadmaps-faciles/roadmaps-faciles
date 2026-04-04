const mocks = vi.hoisted(() => ({
  DsfrButton: vi.fn(),
  DsfrHeading: vi.fn(),
  DsfrSpacer: vi.fn(),
  DsfrText: vi.fn(),
  DsfrEmailLayout: vi.fn(),
  DefaultButton: vi.fn(),
  DefaultHeading: vi.fn(),
  DefaultSpacer: vi.fn(),
  DefaultText: vi.fn(),
  DefaultEmailLayout: vi.fn(),
}));

vi.mock("@/emails/components", () => ({
  DsfrButton: mocks.DsfrButton,
  DsfrHeading: mocks.DsfrHeading,
  DsfrSpacer: mocks.DsfrSpacer,
  DsfrText: mocks.DsfrText,
}));

vi.mock("@/emails/gouv/DsfrEmailLayout", () => ({
  DsfrEmailLayout: mocks.DsfrEmailLayout,
}));

vi.mock("@/emails/default/components", () => ({
  DefaultButton: mocks.DefaultButton,
  DefaultHeading: mocks.DefaultHeading,
  DefaultSpacer: mocks.DefaultSpacer,
  DefaultText: mocks.DefaultText,
}));

vi.mock("@/emails/default/DefaultEmailLayout", () => ({
  DefaultEmailLayout: mocks.DefaultEmailLayout,
}));

import { getEmailKit } from "@/emails/themed";

describe("getEmailKit", () => {
  it("returns DSFR components when theme is Dsfr", () => {
    const kit = getEmailKit("Dsfr");

    expect(kit.Layout).toBe(mocks.DsfrEmailLayout);
    expect(kit.Button).toBe(mocks.DsfrButton);
    expect(kit.Heading).toBe(mocks.DsfrHeading);
    expect(kit.Spacer).toBe(mocks.DsfrSpacer);
    expect(kit.Text).toBe(mocks.DsfrText);
  });

  it("returns Default components when theme is Default", () => {
    const kit = getEmailKit("Default");

    expect(kit.Layout).toBe(mocks.DefaultEmailLayout);
    expect(kit.Button).toBe(mocks.DefaultButton);
    expect(kit.Heading).toBe(mocks.DefaultHeading);
    expect(kit.Spacer).toBe(mocks.DefaultSpacer);
    expect(kit.Text).toBe(mocks.DefaultText);
  });
});
