import "server-only";

import { config } from "@/config";
import { logger } from "@/lib/logger";

import { getOrCreateInstanceId } from "./instanceId";
import { activateLicenseOnline, verifyLicenseOnline } from "./licenseFetcher";
import { isLicenseExpired, parseLicenseKey } from "./licenseVerifier";
import { type LicenseStatus } from "./types";

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h
const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let cachedStatus: LicenseStatus | null = null;
let lastOnlineCheck: Date | null = null;
let activationAttempted = false;

function shouldRefreshOnline(): boolean {
  if (!lastOnlineCheck) return true;
  return Date.now() - lastOnlineCheck.getTime() > REFRESH_INTERVAL_MS;
}

function applyGracePeriod(plan: "GOV_LICENSED" | "LICENSED", expiresAt: Date): LicenseStatus {
  if (!lastOnlineCheck) {
    // Never verified online - trust offline verification
    return { mode: "licensed", valid: true, plan, expiresAt };
  }

  const gracePeriodEnd = new Date(lastOnlineCheck.getTime() + GRACE_PERIOD_MS);
  if (new Date() < gracePeriodEnd) {
    return { mode: "licensed", valid: true, plan, expiresAt, lastVerified: lastOnlineCheck, gracePeriodEnd };
  }

  // Grace period expired
  return { mode: "licensed", valid: false, plan, expiresAt, lastVerified: lastOnlineCheck, gracePeriodEnd };
}

/**
 * Get the current license status. Performs online refresh if needed.
 * This is the primary entrypoint for entitlement checks.
 * @param forceRefresh - bypass the 24h cooldown and force an online check
 */
export async function getLicenseStatus(forceRefresh = false): Promise<LicenseStatus> {
  if (!config.licenseKey) {
    return { mode: "community", valid: false };
  }

  // Offline verify (signature + expiry)
  const { payload, valid } = parseLicenseKey(config.licenseKey);
  if (!valid || !payload) {
    return { mode: "community", valid: false };
  }

  if (isLicenseExpired(payload)) {
    return {
      mode: "licensed",
      valid: false,
      plan: payload.plan,
      expiresAt: new Date(payload.expiresAt),
    };
  }

  // Online refresh
  if (forceRefresh || shouldRefreshOnline()) {
    const instanceId = await getOrCreateInstanceId();
    const online = await verifyLicenseOnline(config.licenseKey, instanceId);
    if (online) {
      const wasFirstVerify = !lastOnlineCheck;
      lastOnlineCheck = new Date();
      cachedStatus = {
        mode: "licensed",
        valid: online.status === "active",
        plan: payload.plan,
        expiresAt: new Date(payload.expiresAt),
        lastVerified: lastOnlineCheck,
      };

      // Auto-activate on first successful verify (fire-and-forget)
      if (wasFirstVerify && !activationAttempted) {
        activationAttempted = true;
        void activateLicenseOnline(config.licenseKey, instanceId).then(result => {
          if (result?.alreadyBound) {
            logger.warn("License already bound to a different instance");
          } else if (result?.activated) {
            logger.info("License activated for this instance");
          }
        });
      }
    } else {
      // Server unreachable - apply grace period
      cachedStatus = applyGracePeriod(payload.plan, new Date(payload.expiresAt));
    }
  }

  return (
    cachedStatus ?? {
      mode: "licensed",
      valid: true,
      plan: payload.plan,
      expiresAt: new Date(payload.expiresAt),
    }
  );
}

/**
 * Get the cached license status (synchronous, no refresh).
 * For hot-path checks where async is not desired.
 */
export function getCachedLicenseStatus(): LicenseStatus {
  return cachedStatus ?? { mode: "community", valid: false };
}
