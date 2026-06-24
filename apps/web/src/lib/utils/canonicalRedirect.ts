import { sanitizeCustomDomain } from "@/utils/customDomain";

/**
 * Normalise un host pour la comparaison anti-boucle : un visiteur sur www.acme.com,
 * acme.com:443 ou acme.com. doit etre considere comme deja sur acme.com.
 */
export const normalizeHost = (host: string): string =>
  host
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
    .replace(/^www\./, "");

interface CanonicalRedirectSettings {
  customDomain: null | string;
  forceCustomDomainRedirect: boolean;
}

/**
 * Hote canonique cible vers lequel rediriger le visiteur, ou null si aucun redirect ne doit avoir
 * lieu. Fonction pure (aucune dependance runtime Next) : reutilisable cote proxy Edge ET cote route
 * Node. Anti-boucle : jamais vers un host de la plateforme (casse le ping-pong inter-tenant), ni si
 * on est deja sur la cible.
 */
export const resolveCanonicalTargetHost = (
  settings: CanonicalRedirectSettings,
  currentHost: string,
  rootDomain: string,
): null | string => {
  if (!settings.forceCustomDomainRedirect || !settings.customDomain) {
    return null;
  }

  const target = sanitizeCustomDomain(settings.customDomain);
  if (!target) {
    return null;
  }

  const normalizedTarget = normalizeHost(target);
  const rootHost = normalizeHost(rootDomain);
  if (normalizedTarget === rootHost || normalizedTarget.endsWith(`.${rootHost}`)) {
    return null;
  }

  if (normalizeHost(currentHost) === normalizedTarget) {
    return null;
  }

  return target;
};

/**
 * Construit l'URL de redirect en host-first : le path et la query (controles par l'URL entrante) ne
 * doivent JAMAIS pouvoir reecrire le host de la cible, sinon `//evil.com` en pathname ouvre un
 * open-redirect.
 */
export const buildCanonicalRedirectUrl = (target: string, pathname: string, search: string): string => {
  const url = new URL(`https://${target}`);
  url.pathname = `/${pathname.replace(/^[/\\]+/, "")}`;
  url.search = search;
  return url.toString();
};
