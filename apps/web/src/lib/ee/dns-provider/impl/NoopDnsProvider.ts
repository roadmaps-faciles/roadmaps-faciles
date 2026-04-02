import { logger } from "@/lib/logger";

import { type DnsProvisionResult, type DnsRecordStatus, type IDnsProvider } from "../IDnsProvider";

export class NoopDnsProvider implements IDnsProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async addRecord(subdomain: string): Promise<DnsProvisionResult> {
    logger.debug({ subdomain }, "NoopDnsProvider addRecord");
    return { provisioned: true, status: "active" };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async removeRecord(subdomain: string): Promise<void> {
    logger.debug({ subdomain }, "NoopDnsProvider removeRecord");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async checkRecord(subdomain: string): Promise<DnsRecordStatus> {
    logger.debug({ subdomain }, "NoopDnsProvider checkRecord");
    return "active";
  }
}
