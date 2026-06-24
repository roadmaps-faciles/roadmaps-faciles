const FQDN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

/**
 * Extrait un hostname propre d'une valeur de domaine saisie a la main (tolere un scheme/path/port
 * accidentels, ne garde que le host). Retourne "" si la valeur n'est pas parsable en URL.
 */
export const sanitizeCustomDomain = (raw: string): string => {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withScheme).hostname.replace(/\.$/, "");
  } catch {
    return "";
  }
};

/**
 * Un custom domain valide est un FQDN, et JAMAIS un host de la plateforme (rootDomain ou un de ses
 * sous-domaines) : l'autoriser permettrait des boucles de redirect via les subdomains canoniques.
 */
export const isValidCustomDomain = (host: string, rootDomain: string): boolean => {
  if (!FQDN_REGEX.test(host)) {
    return false;
  }
  const root = rootDomain.toLowerCase().replace(/:\d+$/, "");
  return host !== root && !host.endsWith(`.${root}`);
};
