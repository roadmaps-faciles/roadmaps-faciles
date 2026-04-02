import "server-only";

import { getServerTrackingProvider } from "./serverFactory";
import { type TrackingEvent, type TrackingGroupTraits, type TrackingUserTraits } from "./types";

/**
 * Fire-and-forget server-side event tracking.
 * Safe to call in server actions / route handlers.
 * Does nothing if tracking provider is noop.
 */
export async function trackServerEvent(distinctId: string, event: TrackingEvent): Promise<void> {
  const provider = await getServerTrackingProvider();
  provider.track(distinctId, event);
}

/**
 * Identify a user server-side (sync traits to PostHog).
 */
export async function identifyServerUser(distinctId: string, traits?: TrackingUserTraits): Promise<void> {
  const provider = await getServerTrackingProvider();
  provider.identify(distinctId, traits);
}

/**
 * Identify a group server-side (e.g., tenant).
 */
export async function identifyServerGroup(
  groupType: string,
  groupId: string,
  traits?: TrackingGroupTraits,
): Promise<void> {
  const provider = await getServerTrackingProvider();
  provider.groupIdentify(groupType, groupId, traits);
}
