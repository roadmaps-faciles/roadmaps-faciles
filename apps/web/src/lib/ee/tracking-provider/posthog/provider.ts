"use client";

import posthog from "posthog-js";

import {
  type IFeatureFlagProvider,
  type ITrackingProvider,
  type TrackingEvent,
  type TrackingEventProperties,
  type TrackingGroupTraits,
  type TrackingUserTraits,
} from "../types";

/**
 * PostHog client-side tracking provider — "full" level.
 *
 * Wraps the posthog-js singleton. Must be initialized via PostHogReactProvider
 * before any calls — queued calls are buffered by posthog-js automatically.
 */
class PostHogTrackingProvider implements IFeatureFlagProvider, ITrackingProvider {
  public readonly level = "full" as const;

  public track(event: TrackingEvent): void {
    posthog.capture(event.name, event.properties);
  }

  public identify(userId: string, traits?: TrackingUserTraits): void {
    posthog.identify(userId, traits);
  }

  public page(properties?: TrackingEventProperties): void {
    posthog.capture("$pageview", properties);
  }

  public group(groupType: string, groupId: string, traits?: TrackingGroupTraits): void {
    posthog.group(groupType, groupId, traits);
  }

  public reset(): void {
    posthog.reset();
  }

  public isFeatureEnabled(flag: string): boolean {
    return posthog.isFeatureEnabled(flag) ?? false;
  }

  public getFeatureFlag(flag: string): boolean | string | undefined {
    return posthog.getFeatureFlag(flag) ?? undefined;
  }

  public onFeatureFlags(callback: () => void): void {
    posthog.onFeatureFlags(callback);
  }
}

export const postHogTrackingProvider: IFeatureFlagProvider & ITrackingProvider = new PostHogTrackingProvider();
