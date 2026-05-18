vi.mock("server-only", () => ({}));

const validPayload = {
  licenseId: "test-id",
  plan: "LICENSED" as const,
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockParseLicenseKey = vi.fn();
const mockIsLicenseExpired = vi.fn();
vi.mock("@/lib/ee/licensing/licenseVerifier", () => ({
  parseLicenseKey: (...args: unknown[]) => mockParseLicenseKey(...args),
  isLicenseExpired: (...args: unknown[]) => mockIsLicenseExpired(...args),
}));

const mockVerifyOnline = vi.fn();
const mockActivateOnline = vi.fn();
vi.mock("@/lib/ee/licensing/licenseFetcher", () => ({
  activateLicenseOnline: (...args: unknown[]) => mockActivateOnline(...args),
  verifyLicenseOnline: (...args: unknown[]) => mockVerifyOnline(...args),
}));

vi.mock("@/lib/ee/licensing/instanceId", () => ({
  getOrCreateInstanceId: () => Promise.resolve("test-instance-id"),
}));

describe("licenseService", () => {
  beforeEach(() => {
    vi.resetModules();
    mockParseLicenseKey.mockReset();
    mockIsLicenseExpired.mockReset();
    mockVerifyOnline.mockReset();
    mockActivateOnline.mockReset();
    mockActivateOnline.mockResolvedValue(null);
  });

  async function importServiceWithConfig(licenseKey: string, instanceId = "inst-1") {
    vi.doMock("@/config", () => ({
      config: { licenseKey, instanceId },
    }));
    return import("@/lib/ee/licensing/licenseService");
  }

  it("returns community mode when no license key", async () => {
    const { getLicenseStatus } = await importServiceWithConfig("");

    const status = await getLicenseStatus();

    expect(status.mode).toBe("community");
    expect(status.valid).toBe(false);
  });

  it("returns community mode when key signature is invalid", async () => {
    mockParseLicenseKey.mockReturnValue({ payload: null, valid: false });

    const { getLicenseStatus } = await importServiceWithConfig("rf_live_bad.key");

    const status = await getLicenseStatus();

    expect(status.mode).toBe("community");
    expect(status.valid).toBe(false);
  });

  it("returns licensed+invalid when key is expired", async () => {
    mockParseLicenseKey.mockReturnValue({ payload: validPayload, valid: true });
    mockIsLicenseExpired.mockReturnValue(true);

    const { getLicenseStatus } = await importServiceWithConfig("rf_live_ok.sig");

    const status = await getLicenseStatus();

    expect(status.mode).toBe("licensed");
    expect(status.valid).toBe(false);
    expect(status.plan).toBe("LICENSED");
  });

  it("returns licensed+valid when offline check passes and online returns active", async () => {
    mockParseLicenseKey.mockReturnValue({ payload: validPayload, valid: true });
    mockIsLicenseExpired.mockReturnValue(false);
    mockVerifyOnline.mockResolvedValue({ status: "active", valid: true });

    const { getLicenseStatus } = await importServiceWithConfig("rf_live_ok.sig");

    const status = await getLicenseStatus();

    expect(status.mode).toBe("licensed");
    expect(status.valid).toBe(true);
    expect(status.lastVerified).toBeInstanceOf(Date);
  });

  it("returns licensed+valid (grace period) when server is unreachable on first call", async () => {
    mockParseLicenseKey.mockReturnValue({ payload: validPayload, valid: true });
    mockIsLicenseExpired.mockReturnValue(false);
    mockVerifyOnline.mockResolvedValue(null); // server unreachable

    const { getLicenseStatus } = await importServiceWithConfig("rf_live_ok.sig");

    const status = await getLicenseStatus();

    // First call, never verified online → trust offline
    expect(status.mode).toBe("licensed");
    expect(status.valid).toBe(true);
  });

  it("getCachedLicenseStatus returns community when never called", async () => {
    const { getCachedLicenseStatus } = await importServiceWithConfig("");

    const status = getCachedLicenseStatus();

    expect(status.mode).toBe("community");
    expect(status.valid).toBe(false);
  });

  it("returns licensed+invalid when online says revoked", async () => {
    mockParseLicenseKey.mockReturnValue({ payload: validPayload, valid: true });
    mockIsLicenseExpired.mockReturnValue(false);
    mockVerifyOnline.mockResolvedValue({ status: "revoked", valid: false });

    const { getLicenseStatus } = await importServiceWithConfig("rf_live_ok.sig");

    const status = await getLicenseStatus();

    expect(status.mode).toBe("licensed");
    expect(status.valid).toBe(false);
  });
});
