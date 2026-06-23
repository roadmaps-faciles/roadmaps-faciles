import { config } from "@/config";

// Hosts de confiance pour bâtir les URLs d'auth (magic link, redirect post-login). On EXCLUT
// volontairement les custom domains tenant : ils ne sont pas vérifiés en propriété (aucun
// challenge TXT à l'écriture du customDomain), donc s'y fier laisserait un attaquant fabriquer
// un host "de confiance" arbitraire via un x-forwarded-host forgé puis voler un token.
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
// `trustedCustomHost` : un customDomain de tenant VÉRIFIÉ (couvert par un OrgDomain vérifié),
// résolu par l'appelant, qu'on accepte en plus des hosts canoniques.
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
