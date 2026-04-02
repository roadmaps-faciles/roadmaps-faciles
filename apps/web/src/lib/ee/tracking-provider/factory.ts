import { type IFeatureFlagProvider, type ITrackingProvider, type TrackingProviderType } from "./types";

type TrackingProviderInstance = IFeatureFlagProvider & ITrackingProvider;

/**
 * Client-side factory — returns the tracking provider + feature flag provider.
 *
 * Must only be called from client components. For server-side tracking,
 * use `getServerTrackingProvider()` from `./serverFactory` instead.
 */
export function getTrackingProvider(type: TrackingProviderType): TrackingProviderInstance {
  switch (type) {
    case "posthog": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { postHogTrackingProvider } = require("./posthog/provider") as typeof import("./posthog/provider");
      return postHogTrackingProvider;
    }
    case "matomo": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { matomoTrackingProvider } = require("./matomo/provider") as typeof import("./matomo/provider");
      return matomoTrackingProvider;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { noopTrackingProvider } = require("./noop") as typeof import("./noop");
      return noopTrackingProvider;
    }
  }
}
