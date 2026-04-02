import "server-only";
import { type Session } from "next-auth";
import { forbidden } from "next/navigation";
import { cache } from "react";

import { appSettingsRepo } from "@/lib/repo";

import { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagsMap } from "./flags";

export { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagsMap } from "./flags";

/**
 * Merge les defaults du registre avec les overrides stockés en DB.
 * Les clés inconnues en DB sont ignorées (flag supprimé du registre).
 */
function mergeFlags(dbOverrides: null | Record<string, unknown> | undefined): FeatureFlagsMap {
  const merged: Record<string, boolean> = { ...FEATURE_FLAGS };

  if (dbOverrides) {
    for (const key of Object.keys(FEATURE_FLAGS)) {
      if (key in dbOverrides && typeof dbOverrides[key] === "boolean") {
        merged[key] = dbOverrides[key];
      }
    }
  }

  return merged;
}

/**
 * Récupère les feature flags (defaults + DB overrides).
 * Cached par request via `React.cache()`.
 */
export const getFeatureFlags = cache(async (): Promise<FeatureFlagsMap> => {
  const appSettings = await appSettingsRepo.get();
  return mergeFlags(appSettings.featureFlags as null | Record<string, unknown>);
});

/**
 * Compute les flags effectifs : super admin → tout à `true`.
 */
export const getEffectiveFlags = async (session: null | Session): Promise<FeatureFlagsMap> => {
  const flags = await getFeatureFlags();

  if (session?.user?.isSuperAdmin) {
    const allEnabled: Record<string, boolean> = { ...flags };
    for (const key of Object.keys(allEnabled)) {
      allEnabled[key] = true;
    }
    return allEnabled;
  }

  return flags;
};

/**
 * Vérifie si un feature flag est activé pour la session courante.
 * Super admin → toujours `true`.
 */
export const isFeatureEnabled = async (key: FeatureFlagKey, session: null | Session): Promise<boolean> => {
  if (session?.user?.isSuperAdmin) return true;
  const flags = await getFeatureFlags();
  return flags[key];
};

/**
 * Assert qu'un feature flag est activé. Appelle `forbidden()` sinon.
 */
export const assertFeature = async (key: FeatureFlagKey, session: null | Session): Promise<void> => {
  const enabled = await isFeatureEnabled(key, session);
  if (!enabled) {
    forbidden();
  }
};
