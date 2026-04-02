export type DnsRecordStatus = "active" | "error" | "pending";

export interface DnsRecord {
  name: string; // FQDN, e.g. "myapp.roadmaps-faciles.fr"
  target: string; // CNAME target, e.g. "roadmaps-faciles.osc-fr1.scalingo.io"
  type: "CNAME";
}

export interface DnsProvisionResult {
  instructions?: DnsInstruction;
  provisioned: boolean;
  status: DnsRecordStatus;
}

export interface DnsInstruction {
  message: string;
  record: DnsRecord;
}

export interface IDnsProvider {
  addRecord(subdomain: string): Promise<DnsProvisionResult>;
  checkRecord(subdomain: string): Promise<DnsRecordStatus>;
  removeRecord(subdomain: string): Promise<void>;
}
