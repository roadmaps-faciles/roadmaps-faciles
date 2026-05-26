import { type UiTheme } from "./types";

/**
 * Inline `<script>` that sets `data-ui-theme` on `<html>` BEFORE first paint.
 * Also adds `dsfr-pending` class for DSFR theme to prevent FOUC
 * (removed by DsfrCssLoader once DSFR CSS is loaded - see globals.scss).
 *
 * Rendering trick: wrap the `<script>` HTML inside a `<div dangerouslySetInnerHTML>`
 * so React sees a div (no "script inside React component" warning). The browser's
 * HTML parser still encounters the script during SSR streaming and executes it
 * synchronously before first paint. innerHTML on the client side is a no-op for
 * scripts, so the script never re-runs on hydration / navigation.
 *
 * Safe: `theme` is a server-side enum ("Default" | "Dsfr"), never user input.
 */
export const ThemeInjector = ({ theme }: { theme: UiTheme }) => {
  const themeAttr = `document.documentElement.dataset.uiTheme="${theme}";`;
  const dsfrPending = theme === "Dsfr" ? 'document.documentElement.classList.add("dsfr-pending");' : "";
  const html = `<script>${themeAttr}${dsfrPending}</script>`;

  return <div hidden suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
};
