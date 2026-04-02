import { type UiTheme } from "./types";

/**
 * Inline `<script>` that sets `data-ui-theme` on `<html>` BEFORE first paint.
 * Also adds `dsfr-pending` class for DSFR theme to prevent FOUC
 * (removed by DsfrCssLoader once DSFR CSS is loaded — see globals.scss).
 *
 * This MUST be a server component rendering a `<script>` tag, NOT a "use client"
 * component with useEffect, because useEffect runs AFTER paint → flash.
 *
 * Safe: `theme` is a server-side enum ("Default" | "Dsfr"), never user input.
 */
export const ThemeInjector = ({ theme }: { theme: UiTheme }) => {
  // Build script content from validated server-side theme value (not user input)
  const themeAttr = `document.documentElement.dataset.uiTheme="${theme}";`;
  const dsfrPending = theme === "Dsfr" ? 'document.documentElement.classList.add("dsfr-pending");' : "";

  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeAttr + dsfrPending }} />;
};
