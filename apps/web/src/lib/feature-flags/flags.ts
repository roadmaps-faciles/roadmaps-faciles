/**
 * Registre des feature flags.
 *
 * Ajouter un flag = ajouter UNE ligne ici + les clés i18n correspondantes.
 * Les valeurs par défaut sont utilisées quand le flag n'est pas overridé en DB.
 */
export const FEATURE_FLAGS = {
  integrations: false,
  themeSwitching: false,
} as const satisfies Record<string, boolean>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

// Quand le registre est vide, FeatureFlagKey = never → on fallback sur Record<string, boolean>
// pour éviter les erreurs TS sur les opérations de merge/assignation.
export type FeatureFlagsMap = [FeatureFlagKey] extends [never]
  ? Record<string, boolean>
  : Record<FeatureFlagKey, boolean>;
