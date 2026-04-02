import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";

import { logger } from "@/lib/logger";

import { getTxtRecordName, VERIFICATION_PREFIX } from "./domain-verification-constants";

// Re-export client-safe functions for backward compatibility
export { getTxtRecordName, VERIFICATION_PREFIX } from "./domain-verification-constants";

const DNS_TIMEOUT_MS = 10_000;

/**
 * Generate a unique verification token for domain ownership.
 */
export function generateVerificationToken(): string {
  return `${VERIFICATION_PREFIX}${randomBytes(32).toString("hex")}`;
}

/**
 * Verify domain ownership by checking DNS TXT records.
 * Looks for the expected token at _roadmaps-faciles-verify.{domain}.
 *
 * Returns true if the token is found, false otherwise.
 * Retries once on failure.
 */
export async function verifyDomainTxt(domain: string, expectedToken: string): Promise<boolean> {
  const recordName = getTxtRecordName(domain);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const records = await resolveTxtWithTimeout(recordName, DNS_TIMEOUT_MS);
      // TXT records are returned as arrays of chunks that should be joined
      const flatRecords = records.map(chunks => chunks.join(""));
      if (flatRecords.includes(expectedToken)) {
        return true;
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      // ENODATA/ENOTFOUND = no TXT records, not a transient error
      if (code === "ENODATA" || code === "ENOTFOUND") {
        return false;
      }
      if (attempt === 0) {
        logger.warn({ err: error, domain, attempt }, "DNS TXT lookup failed, retrying");
        continue;
      }
      logger.warn({ err: error, domain }, "DNS TXT lookup failed after retry");
    }
  }

  return false;
}

/**
 * Check if a domain is a French government domain (.gouv.fr).
 */
export function isGouvDomain(domain: string): boolean {
  return domain.endsWith(".gouv.fr");
}

/**
 * Check if a candidate domain matches a verified domain (exact or subdomain).
 * e.g. "custom.ademe.gouv.fr" matches "ademe.gouv.fr"
 */
export function isDomainProtectedBy(candidateDomain: string, verifiedDomain: string): boolean {
  return candidateDomain === verifiedDomain || candidateDomain.endsWith(`.${verifiedDomain}`);
}

async function resolveTxtWithTimeout(domain: string, timeoutMs: number): Promise<string[][]> {
  return Promise.race([
    resolveTxt(domain),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`DNS lookup timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}
