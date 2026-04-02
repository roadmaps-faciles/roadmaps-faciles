import "server-only";
import { cache } from "react";

import { config } from "@/config";
import { appSettingsRepo } from "@/lib/repo";

export interface RootOAuthProviders {
  github: boolean;
  google: boolean;
  proconnect: boolean;
}

/** Defaults: provider enabled if env vars are configured. */
function getDefaults(): RootOAuthProviders {
  return {
    github: !!config.oauth.github.clientId,
    google: !!config.oauth.google.clientId,
    proconnect: !!config.oauth.proconnect.clientId,
  };
}

/**
 * Merge defaults (based on env var presence) with DB overrides from AppSettings.
 * Unknown keys in DB are ignored. A provider without env vars stays disabled
 * regardless of DB override.
 */
function mergeProviders(dbOverrides: null | Record<string, unknown> | undefined): RootOAuthProviders {
  const defaults = getDefaults();
  const merged = { ...defaults };

  if (dbOverrides) {
    for (const key of Object.keys(defaults) as Array<keyof RootOAuthProviders>) {
      if (key in dbOverrides && typeof dbOverrides[key] === "boolean") {
        // Can only disable a configured provider, not enable an unconfigured one
        merged[key] = defaults[key] && dbOverrides[key];
      }
    }
  }

  return merged;
}

/**
 * Get the root OAuth provider settings (defaults + DB overrides).
 * Cached per request via `React.cache()`.
 */
export const getRootOAuthProviders = cache(async (): Promise<RootOAuthProviders> => {
  const appSettings = await appSettingsRepo.get();
  return mergeProviders(appSettings.rootOAuthProviders as null | Record<string, unknown>);
});
