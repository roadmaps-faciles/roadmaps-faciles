import { config } from "@/config";

// Hosts de confiance pour bâtir les URLs d'auth (magic link, redirect post-login). On EXCLUT
// volontairement les custom domains tenant : leur propriété n'est de confiance qu'une fois prouvée
// (TXT au niveau tenant, customDomainVerifiedAt), sinon un attaquant pourrait fabriquer un host
// "de confiance" arbitraire via un x-forwarded-host forgé puis voler un token.
export function isTrustedAuthHost(host: string): boolean {
  const rootHost = new URL(config.host).host;
  return (
    host === rootHost ||
    host.endsWith(`.${config.rootDomain}`) ||
    config.additionalRootDomains.some(alt => host === alt || host.endsWith(`.${alt}`))
  );
}

// Réécrit une URL d'auth sur le host canonique quand le host de la requête n'est pas de confiance,
// en gardant le path + query porteur du token. Ferme l'injection de host quand AUTH_URL n'est pas
// set (la base de l'URL retombe sinon sur x-forwarded-host, spoofable).
// `trustedCustomHost` : un customDomain de tenant VÉRIFIÉ, résolu par l'appelant, accepté en plus
// des hosts canoniques.
export function toTrustedAuthUrl(rawUrl: string, trustedCustomHost?: null | string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.host.startsWith("0.0.0.0") ? parsed.host.replace("0.0.0.0", "localhost") : parsed.host;
    if (isTrustedAuthHost(host) || (!!trustedCustomHost && host === trustedCustomHost)) return rawUrl;
    // Rebuild from the canonical origin (assigning .host/.protocol would leak the spoofed port).
    return new URL(config.host).origin + parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return new URL(config.host).origin;
  }
}

// Résout la cible d'une redirection post-login NextAuth (callback `redirect`). La base de confiance
// = hosts canoniques + customDomain VÉRIFIÉ servant la requête. Les URLs absolues ne sont préservées
// que si leur host est de confiance (canonique OU le customDomain vérifié courant), sinon fallback
// sur la base de confiance. Helper pur pour être testable hors de la factory NextAuth.
export function resolveTrustedRedirect(
  rawUrl: string,
  opts: { customDomainVerified: boolean; host: null | string; protocol: null | string },
): string {
  const { protocol, host, customDomainVerified } = opts;
  const normalizedHost = host?.startsWith("0.0.0.0") ? host.replace("0.0.0.0", "localhost") : host;
  const hostTrusted = !!normalizedHost && (isTrustedAuthHost(normalizedHost) || customDomainVerified);
  const safeBase =
    protocol && normalizedHost && hostTrusted ? `${protocol}://${normalizedHost}` : new URL(config.host).origin;
  const fallback = `${safeBase}/`;

  if (rawUrl.startsWith("/")) return `${safeBase}${rawUrl}`;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return fallback;
    if (isTrustedAuthHost(parsed.host) || (customDomainVerified && parsed.host === normalizedHost)) return rawUrl;
  } catch {
    // invalid URL - fall through
  }

  return fallback;
}
