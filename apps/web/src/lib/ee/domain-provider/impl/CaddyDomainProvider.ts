import { config } from "@/config";
import { logger } from "@/lib/logger";

import { type DomainStatus, type DomainType, type IDomainProvider } from "../IDomainProvider";

export class CaddyDomainProvider implements IDomainProvider {
  private get adminUrl() {
    return config.domainProvider.caddy.adminUrl;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async addDomain(domain: string, type: DomainType): Promise<void> {
    // On-demand TLS handles certificate provisioning automatically via the `ask` endpoint.
    logger.debug({ domain, type }, "CaddyDomainProvider addDomain — on-demand TLS, no action needed");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async removeDomain(domain: string): Promise<void> {
    // Caddy's on-demand TLS will stop renewing once the `ask` endpoint returns 404.
    logger.debug({ domain }, "CaddyDomainProvider removeDomain — domain removed from DB, cert will not renew");
  }

  public async checkStatus(domain: string): Promise<DomainStatus> {
    try {
      const response = await fetch(`${this.adminUrl}/config/`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) return "active";
      logger.warn({ domain, status: response.status }, "Caddy returned non-OK status");
      return "error";
    } catch (error) {
      logger.warn({ err: error, domain }, "Caddy unreachable");
      return "error";
    }
  }
}
