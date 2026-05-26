import "server-only";

import {
  type IServerTrackingProvider,
  type TrackingEvent,
  type TrackingEventProperties,
  type TrackingGroupTraits,
  type TrackingUserTraits,
} from "../types";

export type CapturedSource = "client" | "server";
export type CapturedType = "group" | "identify" | "page" | "track";

export interface CapturedEvent {
  capturedAt: string;
  distinctId: string;
  event: string;
  id: string;
  properties: TrackingEventProperties;
  source: CapturedSource;
  type: CapturedType;
}

const MAX_EVENTS = 500;

const buffer: CapturedEvent[] = [];

export function pushCapturedEvent(input: Omit<CapturedEvent, "capturedAt" | "id">): CapturedEvent {
  const captured: CapturedEvent = {
    ...input,
    capturedAt: new Date().toISOString(),
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  };
  buffer.push(captured);
  if (buffer.length > MAX_EVENTS) buffer.shift();
  return captured;
}

export function getCapturedEvents(): readonly CapturedEvent[] {
  return [...buffer].reverse();
}

export function clearCapturedEvents(): void {
  buffer.length = 0;
}

export function getCapturedEventsCount(): number {
  return buffer.length;
}

class MemoryServerTrackingProvider implements IServerTrackingProvider {
  public track(distinctId: string, event: TrackingEvent): void {
    pushCapturedEvent({
      distinctId,
      event: event.name,
      properties: event.properties ?? {},
      source: "server",
      type: "track",
    });
  }

  public identify(distinctId: string, traits?: TrackingUserTraits): void {
    pushCapturedEvent({
      distinctId,
      event: "$identify",
      properties: traits ?? {},
      source: "server",
      type: "identify",
    });
  }

  public groupIdentify(groupType: string, groupId: string, traits?: TrackingGroupTraits): void {
    pushCapturedEvent({
      distinctId: groupId,
      event: "$groupidentify",
      properties: { groupId, groupType, ...(traits ?? {}) },
      source: "server",
      type: "group",
    });
  }

  public async shutdown(): Promise<void> {}
}

export const memoryServerTrackingProvider: IServerTrackingProvider = new MemoryServerTrackingProvider();
