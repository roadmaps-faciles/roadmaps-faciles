import "server-only";
import { createPublicKey, verify } from "node:crypto";

import { LICENSING_PUBLIC_KEY } from "./publicKey";
import { type LicensePayload } from "./types";

/**
 * Parse and verify an Ed25519-signed license key.
 *
 * Duplicated from apps/licensing/src/crypto/verify.ts — intentionally self-contained
 * so apps/web/ can verify offline without depending on apps/licensing/.
 */
export function parseLicenseKey(key: string): { payload: LicensePayload | null; valid: boolean } {
  const match = /^rf_live_([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(key);
  if (!match) return { payload: null, valid: false };

  const [, payloadB64, signatureB64] = match;

  let payloadJson: string;
  try {
    payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { payload: null, valid: false };
  }

  let payload: LicensePayload;
  try {
    payload = JSON.parse(payloadJson) as LicensePayload;
  } catch {
    return { payload: null, valid: false };
  }

  if (!payload.licenseId || !payload.plan || !payload.expiresAt) {
    return { payload: null, valid: false };
  }

  const publicKey = createPublicKey({
    key: Buffer.from(LICENSING_PUBLIC_KEY, "base64"),
    format: "der",
    type: "spki",
  });

  const valid = verify(null, Buffer.from(payloadJson), publicKey, Buffer.from(signatureB64, "base64url"));

  return { payload, valid };
}

/** Check if a license payload has expired. */
export function isLicenseExpired(payload: LicensePayload): boolean {
  return new Date(payload.expiresAt) < new Date();
}
