import { config } from "@/config";

import { type DomainStatus, type DomainType, type IDomainProvider } from "../IDomainProvider";
import { ScalingoDomainProvider } from "./ScalingoDomainProvider";

/**
 * Wildcard variant of ScalingoDomainProvider.
 * For subdomains: relies on the existing wildcard certificate (*.rootDomain) — no per-subdomain registration needed.
 * For custom domains: delegates to the standard ScalingoDomainProvider.
 */
export class ScalingoWildcardDomainProvider implements IDomainProvider {
  private readonly delegate = new ScalingoDomainProvider();

  private get rootDomain() {
    return config.rootDomain.replace(/:\d+$/, "");
  }

  private isSubdomain(domain: string): boolean {
    return domain.endsWith(`.${this.rootDomain}`);
  }

  public async addDomain(domain: string, type: DomainType): Promise<void> {
    if (type === "subdomain") {
      // Wildcard covers all subdomains — just verify it's active
      const status = await this.delegate.checkStatus(`*.${this.rootDomain}`);
      if (status !== "active") {
        throw new Error(
          `Wildcard domain *.${this.rootDomain} is not active (status: ${status}). Cannot add subdomain ${domain}.`,
        );
      }
      return;
    }

    // Custom domains need individual registration
    await this.delegate.addDomain(domain, type);
  }

  public async removeDomain(domain: string): Promise<void> {
    if (this.isSubdomain(domain)) {
      // Wildcard covers subdomains — nothing to remove
      return;
    }

    await this.delegate.removeDomain(domain);
  }

  public async checkStatus(domain: string): Promise<DomainStatus> {
    if (this.isSubdomain(domain)) {
      return this.delegate.checkStatus(`*.${this.rootDomain}`);
    }

    return this.delegate.checkStatus(domain);
  }
}
