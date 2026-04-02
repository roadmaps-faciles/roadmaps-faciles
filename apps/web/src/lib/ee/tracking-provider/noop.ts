import { type IFeatureFlagProvider, type IServerTrackingProvider, type ITrackingProvider } from "./types";

class NoopTrackingProvider implements IFeatureFlagProvider, ITrackingProvider {
  public readonly level = "noop" as const;

  public track() {}
  public identify() {}
  public page() {}
  public group() {}
  public reset() {}

  public isFeatureEnabled() {
    return false;
  }
  public getFeatureFlag() {
    return undefined;
  }
  public onFeatureFlags() {}
}

export const noopTrackingProvider: IFeatureFlagProvider & ITrackingProvider = new NoopTrackingProvider();

class NoopServerTrackingProvider implements IServerTrackingProvider {
  public track() {}
  public identify() {}
  public groupIdentify() {}
  public async shutdown() {}
}

export const noopServerTrackingProvider: IServerTrackingProvider = new NoopServerTrackingProvider();
