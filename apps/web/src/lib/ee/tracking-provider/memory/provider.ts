"use client";

import {
  type IFeatureFlagProvider,
  type ITrackingProvider,
  type TrackingEvent,
  type TrackingEventProperties,
  type TrackingGroupTraits,
  type TrackingUserTraits,
} from "../types";

const ENDPOINT = "/api/dev/tracking-debug";

interface ClientCapturePayload {
  distinctId?: string;
  event: string;
  properties?: TrackingEventProperties;
  type: "group" | "identify" | "page" | "track";
}

let currentDistinctId: null | string = null;

function post(payload: ClientCapturePayload): void {
  fetch(ENDPOINT, {
    body: JSON.stringify({
      ...payload,
      distinctId: payload.distinctId ?? currentDistinctId ?? "anonymous",
    }),
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => {});
}

class MemoryTrackingProvider implements IFeatureFlagProvider, ITrackingProvider {
  public readonly level = "full" as const;

  public track(event: TrackingEvent): void {
    post({ event: event.name, properties: event.properties, type: "track" });
  }

  public identify(userId: string, traits?: TrackingUserTraits): void {
    currentDistinctId = userId;
    post({
      distinctId: userId,
      event: "$identify",
      properties: traits,
      type: "identify",
    });
  }

  public page(properties?: TrackingEventProperties): void {
    post({ event: "$pageview", properties, type: "page" });
  }

  public group(groupType: string, groupId: string, traits?: TrackingGroupTraits): void {
    post({
      distinctId: groupId,
      event: "$group",
      properties: { groupId, groupType, ...(traits ?? {}) },
      type: "group",
    });
  }

  public reset(): void {
    currentDistinctId = null;
  }

  public isFeatureEnabled(): boolean {
    return false;
  }

  public getFeatureFlag(): boolean | string | undefined {
    return undefined;
  }

  public onFeatureFlags(): void {}
}

export const memoryTrackingProvider: IFeatureFlagProvider & ITrackingProvider = new MemoryTrackingProvider();
