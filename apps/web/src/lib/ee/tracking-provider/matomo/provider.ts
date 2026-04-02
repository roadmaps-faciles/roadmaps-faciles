import { type IFeatureFlagProvider, type ITrackingProvider } from "../types";

/**
 * Matomo tracking provider — "simple" level.
 *
 * Only tracks page views via the matomo-next script injection.
 * All event/identify/group/feature-flag methods are noops.
 */
class MatomoTrackingProvider implements IFeatureFlagProvider, ITrackingProvider {
  public readonly level = "simple" as const;

  public track() {
    // Matomo doesn't support custom events in this integration
  }

  public identify() {
    // Matomo uses cookie-based anonymous tracking
  }

  public page() {
    // Page views are tracked automatically by the matomo-next script
    // SPA navigations are handled by the MatomoClient component
  }

  public group() {
    // Not supported by Matomo
  }

  public reset() {
    // Matomo doesn't hold user identity to reset
  }

  public isFeatureEnabled() {
    return false;
  }

  public getFeatureFlag() {
    return undefined;
  }

  public onFeatureFlags() {}
}

export const matomoTrackingProvider: IFeatureFlagProvider & ITrackingProvider = new MatomoTrackingProvider();
