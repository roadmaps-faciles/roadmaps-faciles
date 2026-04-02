import { config } from "@/config";

/**
 * Computes the DNS zone name and the zone-relative subdomain for a tenant.
 *
 * When `DNS_ZONE_NAME` is configured and differs from `rootDomain`,
 * the subdomain includes the rootDomain prefix relative to the zone.
 *
 * Example:
 * - rootDomain: "roadmaps.site.fr", zoneName: "site.fr", subdomain: "tenant"
 *   → { zone: "site.fr", zoneSubdomain: "tenant.roadmaps" }
 *
 * - rootDomain: "site.fr", zoneName: "" (default), subdomain: "tenant"
 *   → { zone: "site.fr", zoneSubdomain: "tenant" }
 */
export function computeDnsNames(subdomain: string): { zone: string; zoneSubdomain: string } {
  const rootDomain = config.rootDomain.replace(/:\d+$/, "");
  const zoneName = (config.dnsProvider.zoneName || rootDomain).replace(/:\d+$/, "");

  if (zoneName === rootDomain) {
    return { zone: zoneName, zoneSubdomain: subdomain };
  }

  // rootDomain must end with the zone name
  if (!rootDomain.endsWith(`.${zoneName}`)) {
    // Fallback: if zone doesn't match root domain structure, use root as-is
    return { zone: rootDomain, zoneSubdomain: subdomain };
  }

  // Extract the prefix: "roadmaps.site.fr" minus ".site.fr" → "roadmaps"
  const prefix = rootDomain.slice(0, -(zoneName.length + 1));
  return { zone: zoneName, zoneSubdomain: `${subdomain}.${prefix}` };
}
