import "server-only";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";

import { config } from "@/config";
import { sanitizeCustomDomain } from "@/utils/customDomain";
import { getDomainFromHost } from "@/utils/tenant";

/**
 * Normalise un host pour la comparaison anti-boucle : un visiteur sur www.acme.com,
 * acme.com:443 ou acme.com. doit etre considere comme deja sur acme.com.
 */
const normalizeHost = (host: string): string =>
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
 * Redirige (308) le host courant vers le domaine personnalise du tenant quand le toggle est actif.
 * Sans effet si le flag est off, si aucun customDomain n'est configure, ou si on est deja sur le
 * customDomain (anti-boucle). A appeler hors try/catch : permanentRedirect leve une exception.
 */
export const enforceCanonicalRedirect = async (settings: CanonicalRedirectSettings): Promise<void> => {
  if (!settings.forceCustomDomainRedirect || !settings.customDomain) {
    return;
  }

  const target = sanitizeCustomDomain(settings.customDomain);
  if (!target) {
    return;
  }

  const normalizedTarget = normalizeHost(target);
  const rootHost = normalizeHost(config.rootDomain);
  // Ne jamais rediriger vers un host de la plateforme : casse tout cycle passant par un subdomain
  // canonique (ping-pong entre deux tenants qui se pointent mutuellement).
  if (normalizedTarget === rootHost || normalizedTarget.endsWith(`.${rootHost}`)) {
    return;
  }

  const currentHost = await getDomainFromHost();
  if (normalizeHost(currentHost) === normalizedTarget) {
    return;
  }

  const headersList = await headers();
  // Host-first : le path et la query (controles par l'URL entrante) ne doivent JAMAIS pouvoir
  // reecrire le host de la cible, sinon `//evil.com` en pathname ouvre un open-redirect.
  const url = new URL(`https://${target}`);
  url.pathname = `/${(headersList.get("x-pathname") || "").replace(/^[/\\]+/, "")}`;
  url.search = headersList.get("x-search") || "";

  permanentRedirect(url.toString());
};
