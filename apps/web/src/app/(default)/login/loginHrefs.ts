/**
 * Helpers pour propager `callbackUrl` entre les pages de login. Pour éviter
 * qu'on perde la destination post-login quand l'user navigue entre les modes
 * (password ↔ passwordless ↔ espace-membre ↔ signup).
 *
 * On accepte uniquement des URLs relatives same-host (validation côté server
 * action via NextAuth `redirect` callback de toute façon). On utilise
 * `URLSearchParams` pour l'encodage canonique des params.
 */
export const isSafeRelativeCallbackUrl = (value: null | string | undefined): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

export const withCallbackUrl = (basePath: string, callbackUrl: null | string | undefined): string => {
  if (!isSafeRelativeCallbackUrl(callbackUrl)) return basePath;
  const params = new URLSearchParams({ callbackUrl });
  return `${basePath}?${params.toString()}`;
};
