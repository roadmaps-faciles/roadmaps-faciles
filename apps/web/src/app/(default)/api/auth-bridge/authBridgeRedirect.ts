/**
 * Logique pure du SSO bridge root <-> tenant, extraite du route handler pour
 * être testable sans NextAuth / next/server / DB.
 *
 * Ces helpers couvrent la validation open-redirect (parse + protocol + host) et
 * la construction des URLs de redirection (callbackUrl vers /login, URL bridge
 * finale avec path /login forcé + propagation de `next`). La résolution tenant
 * (custom domain) reste dans le handler car elle dépend de la DB.
 */

/**
 * Parse l'URL de redirection demandée et n'accepte que http/https.
 * Retourne `null` si l'URL est invalide ou utilise un protocole interdit
 * (javascript:, data:, etc.), pour ramener l'appelant sur un fallback sûr.
 */
export const parseRedirectUrl = (redirectUrl: null | string | undefined): null | URL => {
  if (!redirectUrl) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(redirectUrl);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return null;
  }

  return parsedUrl;
};

/**
 * Vrai si l'host est le root host lui-même ou un sous-domaine du root host.
 * Les custom domains ne matchent pas ici (ils nécessitent un lookup DB).
 */
export const isSubdomainOrRootHost = (parsedUrl: URL, rootHost: string): boolean =>
  parsedUrl.host === rootHost || parsedUrl.host.endsWith(`.${rootHost}`);

/**
 * Extrait le subdomain d'un host tenant (sans le suffixe root host ni le port).
 * Retourne `null` si l'host n'est pas un sous-domaine strict du root host
 * (root host lui-même, ou host externe).
 */
export const extractSubdomain = (parsedUrl: URL, rootHost: string): null | string => {
  const isStrictSubdomain = parsedUrl.host !== rootHost && parsedUrl.host.endsWith(`.${rootHost}`);
  if (!isStrictSubdomain) return null;
  return parsedUrl.host.replace(`.${rootHost}`, "").replace(/:\d+$/, "");
};

/**
 * Reconstruit l'URL bridge à partir des params déjà validés (redirect + action)
 * pour la préserver en `callbackUrl` du login. On ne propage pas toute la query
 * string d'origine pour éviter qu'un attaquant injecte des params parasites.
 * Le résultat est relatif (same-host), donc pas d'open redirect possible.
 */
export const buildBridgeCallbackUrl = (redirectUrl: string, action: null | string): string => {
  const preservedParams = new URLSearchParams({ redirect: redirectUrl });
  if (action) preservedParams.set("action", action);
  return `/api/auth-bridge?${preservedParams.toString()}`;
};

/**
 * Construit l'URL de redirection bridge finale vers le tenant. Force le path à
 * `/login` (pour que BridgeAutoLogin s'exécute), pose le `bridge_token`, le flag
 * `bridge_signup` si signup, et propage la destination d'origine en `next` (sauf
 * si c'est `/` ou `/login`, déjà la cible par défaut).
 */
export const buildBridgeRedirectUrl = (parsedUrl: URL, token: string, action: null | string): URL => {
  const originalTarget = parsedUrl.pathname + parsedUrl.search;
  const bridgeRedirectUrl = new URL("/login", parsedUrl);
  bridgeRedirectUrl.searchParams.set("bridge_token", token);
  if (action === "signup") {
    bridgeRedirectUrl.searchParams.set("bridge_signup", "1");
  }
  if (originalTarget !== "/" && originalTarget !== "/login") {
    bridgeRedirectUrl.searchParams.set("next", originalTarget);
  }
  return bridgeRedirectUrl;
};
