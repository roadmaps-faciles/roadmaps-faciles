import "server-only";

import { config } from "@/config";
import { logger } from "@/lib/logger";

interface VerifyResponse {
  expiresAt: string;
  plan: string;
  status: "active" | "expired" | "invalid" | "revoked";
  valid: boolean;
}

/**
 * Call the licensing server to verify a license key online.
 * Returns null if the server is unreachable (grace period applies).
 */
export async function verifyLicenseOnline(key: string, instanceId: string): Promise<null | VerifyResponse> {
  try {
    const res = await fetch(`${config.licensingServerUrl}/api/v1/license/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, instanceId }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as VerifyResponse;
  } catch (err) {
    logger.warn({ err }, "License server unreachable");
    return null;
  }
}
