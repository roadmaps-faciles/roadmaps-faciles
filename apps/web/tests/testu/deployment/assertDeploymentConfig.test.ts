vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const mockConfig = {
  env: "dev" as string,
  deployment: { mode: "self-host" as string },
  stripe: { secretKey: "" as string },
};
vi.mock("@/config", () => ({ config: mockConfig }));

describe("assertDeploymentConfig", () => {
  let assertDeploymentConfig: typeof import("@/lib/deployment").assertDeploymentConfig;

  beforeAll(async () => {
    assertDeploymentConfig = (await import("@/lib/deployment")).assertDeploymentConfig;
  });

  beforeEach(() => {
    mockConfig.env = "dev";
    mockConfig.deployment.mode = "self-host";
    mockConfig.stripe.secretKey = "";
  });

  it("never throws in dev, even with Stripe + self-host", () => {
    mockConfig.stripe.secretKey = "sk_test_x";
    expect(() => assertDeploymentConfig()).not.toThrow();
  });

  it("throws in prod when self-host but Stripe is configured (forgotten DEPLOYMENT_MODE=cloud)", () => {
    mockConfig.env = "prod";
    mockConfig.stripe.secretKey = "sk_live_x";
    expect(() => assertDeploymentConfig()).toThrow(/DEPLOYMENT_MODE/);
  });

  it("does not throw in prod cloud with Stripe configured", () => {
    mockConfig.env = "prod";
    mockConfig.deployment.mode = "cloud";
    mockConfig.stripe.secretKey = "sk_live_x";
    expect(() => assertDeploymentConfig()).not.toThrow();
  });

  it("does not throw in prod self-host without Stripe", () => {
    mockConfig.env = "prod";
    mockConfig.stripe.secretKey = "";
    expect(() => assertDeploymentConfig()).not.toThrow();
  });
});
