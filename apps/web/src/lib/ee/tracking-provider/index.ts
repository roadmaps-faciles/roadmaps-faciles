// Provider abstraction (client-safe)
export { getTrackingProvider } from "./factory";
export { noopTrackingProvider } from "./noop";
export { TrackingContextProvider, useFeatureFlags, useTracking } from "./TrackingContext";
// Tracking plan
export * from "./trackingPlan";

export { TrackingProvider } from "./TrackingProvider";
export { TrackPageView } from "./TrackPageView";

// Types
export type {
  IFeatureFlagProvider,
  IServerTrackingProvider,
  ITrackingProvider,
  TrackingEvent,
  TrackingEventProperties,
  TrackingGroupTraits,
  TrackingLevel,
  TrackingProviderType,
  TrackingUserTraits,
} from "./types";
export { TRACKING_PROVIDER_LEVEL } from "./types";

// Server-side: import { getServerTrackingProvider } from "@/lib/ee/tracking-provider/serverFactory"
// Server-side: import { noopServerTrackingProvider } from "@/lib/ee/tracking-provider/noop"
