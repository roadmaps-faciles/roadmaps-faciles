import "server-only";

import { config } from "@/config";

import { noopServerTrackingProvider } from "./noop";
import { type IServerTrackingProvider } from "./types";

/**
 * Server-side factory — returns the server tracking provider.
 * Only PostHog supports server-side tracking; others return noop.
 */
export async function getServerTrackingProvider(): Promise<IServerTrackingProvider> {
  if (config.tracking.provider === "posthog" && config.tracking.posthogKey) {
    const { postHogServerTrackingProvider } = await import("./posthog/server");
    return postHogServerTrackingProvider;
  }

  return noopServerTrackingProvider;
}
