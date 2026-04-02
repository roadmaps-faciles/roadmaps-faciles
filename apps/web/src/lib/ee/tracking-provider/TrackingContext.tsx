"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { getTrackingProvider } from "./factory";
import { noopTrackingProvider } from "./noop";
import { type IFeatureFlagProvider, type ITrackingProvider, type TrackingProviderType } from "./types";

type TrackingContextValue = IFeatureFlagProvider & ITrackingProvider;

const TrackingContext = createContext<TrackingContextValue>(noopTrackingProvider);

interface TrackingContextProviderProps {
  children: ReactNode;
  enabled: boolean;
  providerType: TrackingProviderType;
}

export function TrackingContextProvider({ children, enabled, providerType }: TrackingContextProviderProps) {
  const provider = useMemo(() => {
    if (!enabled) return noopTrackingProvider;
    return getTrackingProvider(providerType);
  }, [enabled, providerType]);

  return <TrackingContext.Provider value={provider}>{children}</TrackingContext.Provider>;
}

/**
 * Hook to access the tracking provider from client components.
 *
 * @example
 * ```tsx
 * const { track, identify } = useTracking();
 * track(postCreated({ postId, boardId, tenantId, isAnonymous: false }));
 * ```
 */
export function useTracking(): TrackingContextValue {
  return useContext(TrackingContext);
}

/**
 * Hook to access PostHog feature flags.
 * Returns noop when PostHog is not the active provider.
 */
export function useFeatureFlags(): IFeatureFlagProvider {
  return useContext(TrackingContext);
}
