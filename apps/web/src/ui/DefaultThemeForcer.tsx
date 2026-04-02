"use client";

import { useEffect } from "react";

const DSFR_MARKER = "dsfr";

/**
 * Forces Default theme when entering a Default-only section (admin, moderation)
 * during a soft navigation from a DSFR page.
 *
 * On mount: sets data-ui-theme="Default" and disables DSFR stylesheets.
 * On unmount: restores previous theme and re-enables DSFR stylesheets.
 *
 * Limitation: only captures DSFR stylesheets present at mount time.
 * Sheets injected after mount (e.g. from lazy-loaded DSFR bridges still
 * resolving during navigation) are not captured. This is acceptable because
 * admin/moderation sections are Default-only and don't render DSFR bridges.
 */
export const DefaultThemeForcer = () => {
  useEffect(() => {
    const html = document.documentElement;
    const prevTheme = html.dataset.uiTheme;

    // Force Default theme
    html.dataset.uiTheme = "Default";

    // Disable DSFR stylesheets only if coming from DSFR context
    const disabled: Array<HTMLLinkElement | HTMLStyleElement> = [];

    if (prevTheme === "Dsfr") {
      document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']").forEach(link => {
        if (link.href.includes(DSFR_MARKER)) {
          link.disabled = true;
          disabled.push(link);
        }
      });

      // Also target <style> tags injected by webpack/turbopack for DSFR CSS chunks
      document.querySelectorAll<HTMLStyleElement>("style[data-n-href], style[data-precedence]").forEach(style => {
        const href = style.dataset.nHref || style.dataset.precedence || "";
        if (href.includes(DSFR_MARKER)) {
          style.disabled = true;
          disabled.push(style);
        }
      });
    }

    return () => {
      // Restore previous theme (or remove attribute if it wasn't set)
      if (prevTheme) {
        html.dataset.uiTheme = prevTheme;
      } else {
        delete html.dataset.uiTheme;
      }
      disabled.forEach(el => {
        el.disabled = false;
      });
    };
  }, []);

  return null;
};
