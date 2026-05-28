import "server-only";

const stripPort = (h: string) => h.replace(/:\d+$/, "");
const isLocalOrIp = (h: string) => {
  const noPort = stripPort(h);
  return /^localhost$/i.test(noPort) || /^[\d.]+$/.test(noPort);
};

/**
 * Si le host courant est sur le `rootDomain` (ou un `additionalRootDomain`) ou
 * un de leurs sous-domaines, retourne le `.rootDomain` à utiliser comme cookie
 * domain pour partager la session entre root et tous les sous-domaines tenants.
 * Sinon (custom domain, localhost, IP), retourne `undefined` : NextAuth scope
 * le cookie au host exact (comportement par défaut). Le bridge token gère le
 * hand-off pour les custom domains (cf. `/api/auth-bridge` + `bridgeSignIn`).
 */
export function getCrossSubdomainCookieDomain(
  rawHost: null | string | undefined,
  knownRoots: readonly string[],
): string | undefined {
  if (!rawHost) return undefined;
  const hostNoPort = stripPort(rawHost);
  for (const root of knownRoots) {
    if (!root || isLocalOrIp(root)) continue;
    const rootNoPort = stripPort(root);
    if (hostNoPort === rootNoPort || hostNoPort.endsWith(`.${rootNoPort}`)) {
      return `.${rootNoPort}`;
    }
  }
  return undefined;
}
