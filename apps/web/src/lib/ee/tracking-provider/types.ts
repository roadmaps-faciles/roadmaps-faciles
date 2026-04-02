/**
 * Tracking provider abstraction.
 *
 * Three levels:
 *  - "noop"   — no tracking at all (default in dev)
 *  - "simple" — page views only (Matomo)
 *  - "full"   — events, identify, group, feature flags (PostHog)
 */

export type TrackingProviderType = "matomo" | "noop" | "posthog";

export type TrackingLevel = "full" | "noop" | "simple";

export const TRACKING_PROVIDER_LEVEL: Record<TrackingProviderType, TrackingLevel> = {
  noop: "noop",
  matomo: "simple",
  posthog: "full",
};

// ─── Event types ──────────────────────────────────────────────────────

export interface TrackingEventProperties {
  [key: string]: boolean | null | number | string | undefined;
}

export interface TrackingEvent<T extends TrackingEventProperties = TrackingEventProperties> {
  name: string;
  properties?: T;
}

export interface TrackingUserTraits {
  [key: string]: boolean | null | number | string | undefined;
  email?: string;
  name?: string;
  role?: string;
  tenantId?: string;
}

export interface TrackingGroupTraits {
  [key: string]: boolean | null | number | string | undefined;
  name?: string;
  plan?: string;
  subdomain?: string;
}

// ─── Provider interface ───────────────────────────────────────────────

export interface ITrackingProvider {
  /** Associate the user with a group (e.g. tenant). */
  group(groupType: string, groupId: string, traits?: TrackingGroupTraits): void;

  /** Identify the current user. */
  identify(userId: string, traits?: TrackingUserTraits): void;

  readonly level: TrackingLevel;

  /** Record a page view (automatic in PostHog, manual in Matomo). */
  page(properties?: TrackingEventProperties): void;

  /** Reset identity (on logout). */
  reset(): void;

  /** Track a named event with optional properties. */
  track(event: TrackingEvent): void;
}

// ─── Feature flags (PostHog only) ─────────────────────────────────────

export interface IFeatureFlagProvider {
  getFeatureFlag(flag: string): boolean | string | undefined;
  isFeatureEnabled(flag: string): boolean;
  onFeatureFlags(callback: () => void): void;
}

// ─── Server-side tracking ─────────────────────────────────────────────

export interface IServerTrackingProvider {
  groupIdentify(groupType: string, groupId: string, traits?: TrackingGroupTraits): void;
  identify(distinctId: string, traits?: TrackingUserTraits): void;
  shutdown(): Promise<void>;
  track(distinctId: string, event: TrackingEvent): void;
}
