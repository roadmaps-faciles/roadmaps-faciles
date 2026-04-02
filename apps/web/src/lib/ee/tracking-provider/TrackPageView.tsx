"use client";

import { useEffect, useRef } from "react";

import { useTracking } from "./TrackingContext";
import { type TrackingEvent } from "./types";

interface TrackPageViewProps {
  event: TrackingEvent;
}

/**
 * Fire-and-forget client-side page view tracking.
 * Renders nothing — just fires the event on mount.
 *
 * @example
 * ```tsx
 * <TrackPageView event={postViewed({ postId, boardId, tenantId })} />
 * ```
 */
export function TrackPageView({ event }: TrackPageViewProps) {
  const tracking = useTracking();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    tracking.track(event);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
