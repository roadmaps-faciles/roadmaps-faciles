/**
 * Helpers de validation et de propagation des URLs de redirection du flow login
 * (callbackUrl entre les modes password / passwordless / espace-membre / signup,
 * et redirection post-login). On n'accepte que des cibles relatives same-host.
 *
 * Un `startsWith("/") && !startsWith("//")` laissait passer "/\evil.com" : les
 * navigateurs normalisent "\" en "/", donc la valeur devient "//evil.com"
 * (protocol-relative) et redirige hors site. On résout via `new URL` (qui normalise
 * backslash, tab/newline strippés par WHATWG, et les schémas absolus) puis on compare
 * l'origine. La base sentinelle est constante pour que le prédicat reste pur et SSR-safe
 * (pas de dépendance à window) : on ne juge que le caractère relatif same-origin.
 */
const SAME_ORIGIN_SENTINEL = "https://callback.invalid";

export const isSafeRelativeCallbackUrl = (value: null | string | undefined): value is string => {
  if (typeof value !== "string" || !value.startsWith("/")) return false;
  try {
    return new URL(value, SAME_ORIGIN_SENTINEL).origin === SAME_ORIGIN_SENTINEL;
  } catch {
    return false;
  }
};

export const withCallbackUrl = (basePath: string, callbackUrl: null | string | undefined): string => {
  if (!isSafeRelativeCallbackUrl(callbackUrl)) return basePath;
  const params = new URLSearchParams({ callbackUrl });
  return `${basePath}?${params.toString()}`;
};

/**
 * Variante "valeur" pour une redirection côté client (window.location.href), où la
 * sanitisation doit être visible au point d'assignation. Résout la cible contre
 * `origin` (window.location.origin) et ne réémet que le path same-origin (pathname +
 * search + hash), ou "/" si la cible s'évade de l'origine ou est non-parsable.
 */
export const resolveSameOriginPath = (raw: null | string, origin: string): string => {
  if (!raw) return "/";
  try {
    const url = new URL(raw, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
};
