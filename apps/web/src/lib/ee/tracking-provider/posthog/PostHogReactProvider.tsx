"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { type ReactNode, useEffect, useRef } from "react";

interface PostHogReactProviderProps {
  apiKey: string;
  children: ReactNode;
  enabled: boolean;
  host: string;
}

export function PostHogReactProvider({ apiKey, children, enabled, host }: PostHogReactProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!enabled || !apiKey || initialized.current) return;

    posthog.init(apiKey, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      cross_subdomain_cookie: false,
      // No session replay
      disable_session_recording: true,
      // Feature flags
      advanced_disable_feature_flags: false,
      // Respect DNT
      respect_dnt: true,
    });

    initialized.current = true;
  }, [apiKey, enabled, host]);

  if (!enabled || !apiKey) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
