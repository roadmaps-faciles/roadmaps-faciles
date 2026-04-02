/**
 * Constants for domain verification — client-safe (no Node.js imports).
 */

export const VERIFICATION_PREFIX = "roadmaps-faciles-verify=";
export const DNS_SUBDOMAIN_PREFIX = "_roadmaps-faciles-verify";

/**
 * Build the TXT record name for a domain.
 * Pattern: _roadmaps-faciles-verify.example.com
 */
export function getTxtRecordName(domain: string): string {
  return `${DNS_SUBDOMAIN_PREFIX}.${domain}`;
}
