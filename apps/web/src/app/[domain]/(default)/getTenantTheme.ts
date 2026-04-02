import "server-only";

import { getTheme } from "@/ui/server";

/**
 * Resolve the UI theme for tenant-level pages that don't have direct access
 * to tenantSettings (error.tsx, not-found.tsx, unauthorized.tsx, forbidden.tsx).
 *
 * In dev: reads the `ui-theme-dev` cookie override.
 * In prod: falls back to "Default" (tenant settings not available in error boundaries).
 *
 * TODO: resolve tenant settings from headers (like the layout does) for prod accuracy.
 */
export const getTenantTheme = () => getTheme();
