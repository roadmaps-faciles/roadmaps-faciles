import dns from "node:dns/promises";

import { config } from "@/config";
import { logger } from "@/lib/logger";

import { computeDnsNames } from "../dnsUtils";
import { type DnsProvisionResult, type DnsRecordStatus, type IDnsProvider } from "../IDnsProvider";

export class ManualDnsProvider implements IDnsProvider {
  private get target() {
    return config.dnsProvider.target;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async addRecord(subdomain: string): Promise<DnsProvisionResult> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const fqdn = `${zoneSubdomain}.${zone}`;
    const record = { name: fqdn, target: this.target, type: "CNAME" as const };

    logger.info({ fqdn, target: this.target }, "Manual DNS record needed");

    return {
      provisioned: false,
      status: "pending",
      instructions: {
        message: `Veuillez créer un enregistrement DNS CNAME pour "${fqdn}" pointant vers "${this.target}".`,
        record,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async removeRecord(subdomain: string): Promise<void> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const fqdn = `${zoneSubdomain}.${zone}`;
    logger.info({ fqdn }, "Manual DNS removal needed");
  }

  public async checkRecord(subdomain: string): Promise<DnsRecordStatus> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const fqdn = `${zoneSubdomain}.${zone}`;

    try {
      const records = await dns.resolveCname(fqdn);
      const normalizedTarget = this.target.replace(/\.$/, "");
      if (records.some(r => r.replace(/\.$/, "") === normalizedTarget)) {
        return "active";
      }
      return "error";
    } catch {
      return "pending";
    }
  }
}
