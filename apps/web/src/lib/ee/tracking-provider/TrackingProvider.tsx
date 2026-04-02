"use client";

import { type ReactNode, useCallback, lazy } from "react";

// TODO: restore useConsent from @/consentManagement once DSFR CSS isolation is done.
// import { useConsent } from "@/consentManagement";
const useConsent = () => ({ finalityConsent: undefined as Record<string, boolean> | undefined });

const MatomoClient = lazy(() => import("./matomo/MatomoClient").then(m => ({ default: m.MatomoClient })));
import { PostHogReactProvider } from "./posthog/PostHogReactProvider";
import { TrackingContextProvider } from "./TrackingContext";
import { type TrackingProviderType } from "./types";

interface TrackingProviderProps {
  children: ReactNode;
  matomo?: {
    siteId: string;
    url: string;
  };
  posthog?: {
    apiKey: string;
    host: string;
  };
  providerType: TrackingProviderType;
}

/**
 * Top-level tracking provider that:
 * 1. Checks DSFR consent before enabling tracking
 * 2. Renders the correct SDK provider (PostHog / Matomo / noop)
 * 3. Provides the TrackingContext for hooks
 */
export function TrackingProvider({ children, matomo, posthog, providerType }: TrackingProviderProps) {
  const { finalityConsent } = useConsent();

  const isConsented = useCallback(
    (finality: string) => {
      if (!finalityConsent) return false;
      return finalityConsent[finality] === true;
    },
    [finalityConsent],
  );

  const trackingEnabled =
    providerType === "noop"
      ? false
      : providerType === "posthog"
        ? isConsented("posthog")
        : providerType === "matomo"
          ? isConsented("matomo")
          : false;

  // PostHog needs to wrap children (it's a React Context Provider)
  // Matomo is a side-effect-only component (renders nothing)
  const wrappedChildren =
    providerType === "posthog" && posthog ? (
      <PostHogReactProvider apiKey={posthog.apiKey} enabled={trackingEnabled} host={posthog.host}>
        {children}
      </PostHogReactProvider>
    ) : (
      <>
        {providerType === "matomo" && matomo && (
          <MatomoClient enabled={trackingEnabled} siteId={matomo.siteId} url={matomo.url} />
        )}
        {children}
      </>
    );

  return (
    <TrackingContextProvider enabled={trackingEnabled} providerType={providerType}>
      {wrappedChildren}
    </TrackingContextProvider>
  );
}
