import { logger } from "@/lib/logger";

import { type DomainStatus, type DomainType, type IDomainProvider } from "../IDomainProvider";

export class NoopDomainProvider implements IDomainProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async addDomain(domain: string, type: DomainType): Promise<void> {
    logger.debug({ domain, type }, "NoopDomainProvider addDomain");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async removeDomain(domain: string): Promise<void> {
    logger.debug({ domain }, "NoopDomainProvider removeDomain");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async checkStatus(domain: string): Promise<DomainStatus> {
    logger.debug({ domain }, "NoopDomainProvider checkStatus");
    return "active";
  }
}
