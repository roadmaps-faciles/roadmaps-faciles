import "server-only";
import { PostHog } from "posthog-node";

import { config } from "@/config";

import {
  type IServerTrackingProvider,
  type TrackingEvent,
  type TrackingGroupTraits,
  type TrackingUserTraits,
} from "../types";

let instance: null | PostHog = null;

function getPostHogServer(): null | PostHog {
  if (!config.tracking.posthogKey) return null;

  if (!instance) {
    instance = new PostHog(config.tracking.posthogKey, {
      host: config.tracking.posthogHost,
      flushAt: 20,
      flushInterval: 10_000,
    });
  }
  return instance;
}

class PostHogServerTrackingProvider implements IServerTrackingProvider {
  public track(distinctId: string, event: TrackingEvent): void {
    getPostHogServer()?.capture({
      distinctId,
      event: event.name,
      properties: event.properties,
    });
  }

  public identify(distinctId: string, traits?: TrackingUserTraits): void {
    getPostHogServer()?.identify({
      distinctId,
      properties: traits,
    });
  }

  public groupIdentify(groupType: string, groupId: string, traits?: TrackingGroupTraits): void {
    getPostHogServer()?.groupIdentify({
      groupType,
      groupKey: groupId,
      properties: traits,
    });
  }

  public async shutdown(): Promise<void> {
    await instance?.shutdown();
    instance = null;
  }
}

export const postHogServerTrackingProvider: IServerTrackingProvider = new PostHogServerTrackingProvider();
