"use client";

import { init } from "@socialgouv/matomo-next";
import { useEffect, useRef } from "react";

interface MatomoClientProps {
  enabled: boolean;
  siteId: string;
  url: string;
}

/**
 * Initializes Matomo client-side tracking.
 * Renders nothing — only runs the init side-effect.
 */
export function MatomoClient({ enabled, siteId, url }: MatomoClientProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!enabled || !url || !siteId || initialized.current) return;

    init({ siteId, url });
    initialized.current = true;
  }, [enabled, siteId, url]);

  return null;
}
