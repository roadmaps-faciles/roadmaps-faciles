import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return { ...actual, cache: (fn: Function) => fn };
});

const mockGet = vi.fn();
vi.mock("@/lib/repo", () => ({
  appSettingsRepo: { get: mockGet },
}));

vi.mock("@/config", () => ({
  config: {
    oauth: {
      github: { clientId: "gh-id" },
      google: { clientId: "" },
      proconnect: { clientId: "pc-id" },
    },
  },
}));

describe("getRootOAuthProviders", () => {
  it("returns defaults based on config (github + proconnect configured, google not)", async () => {
    mockGet.mockResolvedValue({ rootOAuthProviders: null });
    const { getRootOAuthProviders } = await import("@/lib/utils/rootOAuthProviders");
    const result = await getRootOAuthProviders();

    expect(result.github).toBe(true);
    expect(result.google).toBe(false);
    expect(result.proconnect).toBe(true);
  });

  it("DB override can disable a configured provider", async () => {
    mockGet.mockResolvedValue({ rootOAuthProviders: { github: false } });
    vi.resetModules();
    const { getRootOAuthProviders } = await import("@/lib/utils/rootOAuthProviders");
    const result = await getRootOAuthProviders();

    expect(result.github).toBe(false);
  });

  it("DB override cannot enable an unconfigured provider", async () => {
    mockGet.mockResolvedValue({ rootOAuthProviders: { google: true } });
    vi.resetModules();
    const { getRootOAuthProviders } = await import("@/lib/utils/rootOAuthProviders");
    const result = await getRootOAuthProviders();

    expect(result.google).toBe(false);
  });
});
