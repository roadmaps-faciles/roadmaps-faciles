import "server-only";

import { type TenantSettings } from "@/lib/model/TenantSettings";

import { type UiTheme } from "./types";

/**
 * Resolve the UI theme from tenant settings.
 * In development, a `ui-theme-dev` cookie overrides the DB value for quick theme switching.
 * For root pages (no tenant context), always returns "Default".
 */
export const getTheme = async (settings?: null | Pick<TenantSettings, "uiTheme">): Promise<UiTheme> => {
  if (process.env.NODE_ENV === "development") {
    try {
      const { cookies } = await import("next/headers");
      const override = (await cookies()).get("ui-theme-dev")?.value;
      if (override === "Default" || override === "Dsfr") return override;
    } catch {
      // Outside request scope (e.g., tests) — skip cookie override
    }
  }

  if (!settings) return "Default";
  return settings.uiTheme ?? "Default";
};
