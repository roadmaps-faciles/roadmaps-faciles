"use client";

import "@codegouvfr/react-dsfr/assets/dsfr_plus_icons.css";
import { useEffect } from "react";

/**
 * Side-effect-only component that imports DSFR CSS.
 * Must be loaded via React.lazy() in a "use client" component to prevent
 * Turbopack from eagerly bundling the CSS into Default theme pages.
 *
 * On mount, removes the `dsfr-pending` class from `<html>` to reveal content
 * (anti-FOUC: see globals.scss for the matching `visibility: hidden` rule).
 *
 * StartDsfrOnHydration is NOT needed here — the layout's DsfrProvider already handles it.
 */
export const DsfrCssLoader = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dsfr-pending");
  }, []);
  return null;
};
