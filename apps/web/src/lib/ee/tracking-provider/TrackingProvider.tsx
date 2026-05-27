"use client";

import { lazy, type ReactNode, useCallback } from "react";

import { useConsent } from "@/consent";

import { PostHogReactProvider } from "./posthog/PostHogReactProvider";
import { TrackingContextProvider } from "./TrackingContext";
import { type TrackingProviderType } from "./types";

const MatomoClient = lazy(() => import("./matomo/MatomoClient").then(m => ({ default: m.MatomoClient })));

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

export function TrackingProvider({ children, matomo, posthog, providerType }: TrackingProviderProps) {
  const { finalityConsent } = useConsent();

  const isConsented = useCallback(
    (finality: "matomo" | "posthog") => finalityConsent?.[finality] === true,
    [finalityConsent],
  );

  const trackingEnabled =
    providerType === "noop"
      ? false
      : providerType === "posthog"
        ? isConsented("posthog")
        : providerType === "matomo"
          ? isConsented("matomo")
          : providerType === "memory"
            ? true
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
