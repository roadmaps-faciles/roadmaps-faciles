import { promises as dns } from "node:dns";

import { config } from "@/config";

export type DNSStatus = "error" | "invalid" | "valid";

export interface DNSVerificationResult {
  expected: string;
  records: string[];
  status: DNSStatus;
}

export async function verifyDNS(customDomain: string): Promise<DNSVerificationResult> {
  const expected = config.rootDomain.replace(/:\d+$/, "");
  try {
    // 1. Essayer CNAME (catch séparé car resolveCname lance si aucun CNAME n'existe)
    const cnames = await dns.resolveCname(customDomain).catch(() => []);
    if (cnames.some(c => c === expected || c.endsWith(`.${expected}`))) {
      return { status: "valid", records: cnames, expected };
    }
    // 2. Fallback A/AAAA : comparer les IPs du custom domain avec celles du rootDomain
    const [customIPs, rootIPs] = await Promise.all([
      dns.resolve4(customDomain).catch<string[]>(() => []),
      dns.resolve4(expected).catch<string[]>(() => []),
    ]);
    if (rootIPs.length > 0 && customIPs.some(ip => rootIPs.includes(ip))) {
      return { status: "valid", records: customIPs, expected };
    }
    // Si aucun record résolu du tout → error (domaine inexistant)
    if (cnames.length === 0 && customIPs.length === 0) {
      return { status: "error", records: [], expected };
    }
    return { status: "invalid", records: [...cnames, ...customIPs], expected };
  } catch {
    return { status: "error", records: [], expected };
  }
}
