import { noopServerTrackingProvider, noopTrackingProvider } from "@/lib/ee/tracking-provider/noop";
import { TRACKING_PROVIDER_LEVEL } from "@/lib/ee/tracking-provider/types";

describe("TRACKING_PROVIDER_LEVEL", () => {
  it("maps noop to noop", () => {
    expect(TRACKING_PROVIDER_LEVEL.noop).toBe("noop");
  });

  it("maps matomo to simple", () => {
    expect(TRACKING_PROVIDER_LEVEL.matomo).toBe("simple");
  });

  it("maps posthog to full", () => {
    expect(TRACKING_PROVIDER_LEVEL.posthog).toBe("full");
  });
});

describe("noopTrackingProvider", () => {
  it("has level noop", () => {
    expect(noopTrackingProvider.level).toBe("noop");
  });

  it("track does not throw", () => {
    expect(() => noopTrackingProvider.track({ name: "test" })).not.toThrow();
  });

  it("identify does not throw", () => {
    expect(() => noopTrackingProvider.identify("user-1")).not.toThrow();
  });

  it("page does not throw", () => {
    expect(() => noopTrackingProvider.page()).not.toThrow();
  });

  it("group does not throw", () => {
    expect(() => noopTrackingProvider.group("tenant", "1")).not.toThrow();
  });

  it("reset does not throw", () => {
    expect(() => noopTrackingProvider.reset()).not.toThrow();
  });

  it("isFeatureEnabled returns false", () => {
    expect(noopTrackingProvider.isFeatureEnabled("any-flag")).toBe(false);
  });

  it("getFeatureFlag returns undefined", () => {
    expect(noopTrackingProvider.getFeatureFlag("any-flag")).toBeUndefined();
  });

  it("onFeatureFlags does not throw", () => {
    expect(() => noopTrackingProvider.onFeatureFlags(() => {})).not.toThrow();
  });
});

describe("noopServerTrackingProvider", () => {
  it("track does not throw", () => {
    expect(() => noopServerTrackingProvider.track("user-1", { name: "test" })).not.toThrow();
  });

  it("identify does not throw", () => {
    expect(() => noopServerTrackingProvider.identify("user-1")).not.toThrow();
  });

  it("groupIdentify does not throw", () => {
    expect(() => noopServerTrackingProvider.groupIdentify("tenant", "1")).not.toThrow();
  });

  it("shutdown resolves", async () => {
    await expect(noopServerTrackingProvider.shutdown()).resolves.toBeUndefined();
  });
});
