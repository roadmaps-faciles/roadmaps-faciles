export type DomainType = "custom" | "subdomain";
export type DomainStatus = "active" | "error" | "pending";

export interface IDomainProvider {
  addDomain(domain: string, type: DomainType): Promise<void>;
  checkStatus(domain: string): Promise<DomainStatus>;
  removeDomain(domain: string): Promise<void>;
}
