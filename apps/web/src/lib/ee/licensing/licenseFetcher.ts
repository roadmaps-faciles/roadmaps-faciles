import "server-only";

import { config } from "@/config";
import { logger } from "@/lib/logger";

interface VerifyResponse {
  expiresAt: string;
  plan: string;
  status: "active" | "expired" | "invalid" | "revoked";
  valid: boolean;
}

interface ActivateResponse {
  activated: boolean;
  alreadyBound: boolean;
}

/**
 * Call the licensing server to activate (bind) a license key to this instance.
 * Returns null if the server is unreachable.
 * Returns { alreadyBound: true } if the key is already bound to a different instance (409).
 */
export async function activateLicenseOnline(key: string, instanceId: string): Promise<ActivateResponse | null> {
  try {
    const res = await fetch(`${config.licensingServerUrl}/api/v1/license/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, instanceId }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 409) {
      return { activated: false, alreadyBound: true };
    }
    if (!res.ok) return null;
    return (await res.json()) as ActivateResponse;
  } catch (err) {
    logger.warn({ err }, "License activation server unreachable");
    return null;
  }
}

/**
 * Call the licensing server to verify a license key online.
 * Returns null if the server is unreachable (grace period applies).
 *
 * `dryRun` : vérification en lecture seule (n'enregistre pas l'instanceId côté serveur,
 * pas de comptage multi-instance). Utilisé par le test de clé admin pour ne pas polluer
 * le log de vérifications ni déclencher un faux warning d'usage multi-instance.
 */
export async function verifyLicenseOnline(
  key: string,
  instanceId: string,
  dryRun = false,
): Promise<null | VerifyResponse> {
  try {
    const res = await fetch(`${config.licensingServerUrl}/api/v1/license/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, instanceId, dryRun }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as VerifyResponse;
  } catch (err) {
    logger.warn({ err }, "License server unreachable");
    return null;
  }
}
