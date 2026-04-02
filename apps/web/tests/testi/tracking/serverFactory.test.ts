vi.mock("server-only", () => ({}));

vi.mock("@/config", () => ({
  config: {
    tracking: {
      provider: "noop" as string,
      posthogKey: "",
      posthogHost: "https://eu.i.posthog.com",
    },
  },
}));

const mockPostHogServerProvider = {
  track: vi.fn(),
  identify: vi.fn(),
  groupIdentify: vi.fn(),
  shutdown: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/lib/ee/tracking-provider/posthog/server", () => ({
  postHogServerTrackingProvider: mockPostHogServerProvider,
}));

describe("getServerTrackingProvider", () => {
  let getServerTrackingProvider: typeof import("@/lib/ee/tracking-provider/serverFactory").getServerTrackingProvider;
  let config: { tracking: { provider: string; posthogKey: string; posthogHost: string } };

  beforeEach(async () => {
    vi.clearAllMocks();
    const configMod = await import("@/config");
    config = configMod.config as typeof config;
    // Reset to noop defaults
    config.tracking.provider = "noop";
    config.tracking.posthogKey = "";

    const mod = await import("@/lib/ee/tracking-provider/serverFactory");
    getServerTrackingProvider = mod.getServerTrackingProvider;
  });

  it("returns noop provider when config is noop", async () => {
    const provider = await getServerTrackingProvider();
    // Call track — if it were the posthog mock, the mock would be called
    provider.track("u1", { name: "test" });
    expect(mockPostHogServerProvider.track).not.toHaveBeenCalled();
  });

  it("returns noop provider when config is matomo (no server-side support)", async () => {
    config.tracking.provider = "matomo";
    const provider = await getServerTrackingProvider();
    provider.track("u1", { name: "test" });
    expect(mockPostHogServerProvider.track).not.toHaveBeenCalled();
  });

  it("returns posthog provider when config is posthog with key", async () => {
    config.tracking.provider = "posthog";
    config.tracking.posthogKey = "phc_test123";
    const provider = await getServerTrackingProvider();
    expect(provider).toBe(mockPostHogServerProvider);
  });

  it("returns noop provider when posthog is set but key is empty", async () => {
    config.tracking.provider = "posthog";
    config.tracking.posthogKey = "";
    const provider = await getServerTrackingProvider();
    provider.track("u1", { name: "test" });
    expect(mockPostHogServerProvider.track).not.toHaveBeenCalled();
  });
});
