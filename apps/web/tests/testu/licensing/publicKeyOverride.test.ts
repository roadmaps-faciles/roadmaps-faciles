const CANONICAL = "MCowBQYDK2VwAyEAfTWdd1TDpuMILwyGax7M5Q2kt4bmXPBgmZIqR2+OQ3I=";

describe("LICENSING_PUBLIC_KEY dev override", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ignores the dev override in prod (keeps the canonical key)", async () => {
    vi.stubEnv("APP_ENV", "prod");
    vi.stubEnv("LICENSING_DEV_PUBLIC_KEY", "DEV_OVERRIDE_KEY");

    const { LICENSING_PUBLIC_KEY } = await import("@/lib/ee/licensing/publicKey");

    expect(LICENSING_PUBLIC_KEY).toBe(CANONICAL);
  });

  it("uses the dev override in dev when set", async () => {
    vi.stubEnv("APP_ENV", "dev");
    vi.stubEnv("LICENSING_DEV_PUBLIC_KEY", "DEV_OVERRIDE_KEY");

    const { LICENSING_PUBLIC_KEY } = await import("@/lib/ee/licensing/publicKey");

    expect(LICENSING_PUBLIC_KEY).toBe("DEV_OVERRIDE_KEY");
  });

  it("falls back to the canonical key in dev without an override", async () => {
    vi.stubEnv("APP_ENV", "dev");

    const { LICENSING_PUBLIC_KEY } = await import("@/lib/ee/licensing/publicKey");

    expect(LICENSING_PUBLIC_KEY).toBe(CANONICAL);
  });
});
