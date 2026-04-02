import { createHash } from "node:crypto";

import { config } from "@/config";

import { computeDnsNames } from "../dnsUtils";
import { type DnsProvisionResult, type DnsRecordStatus, type IDnsProvider } from "../IDnsProvider";

const OVH_ENDPOINTS = {
  "ovh-eu": "https://eu.api.ovh.com/1.0",
  "ovh-ca": "https://ca.api.ovh.com/1.0",
} as const;

interface OvhDnsRecord {
  fieldType: string;
  id: number;
  subDomain: string;
  target: string;
  ttl: number;
  zone: string;
}

export class OvhDnsProvider implements IDnsProvider {
  private get target() {
    return config.dnsProvider.target;
  }

  private get baseUrl() {
    return OVH_ENDPOINTS[config.dnsProvider.ovh.endpoint];
  }

  private get appKey() {
    return config.dnsProvider.ovh.applicationKey;
  }

  private get appSecret() {
    return config.dnsProvider.ovh.applicationSecret;
  }

  private get consumerKey() {
    return config.dnsProvider.ovh.consumerKey;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyStr = body ? JSON.stringify(body) : "";

    const signature = this.sign(method, url, bodyStr, timestamp);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": this.appKey,
        "X-Ovh-Consumer": this.consumerKey,
        "X-Ovh-Signature": signature,
        "X-Ovh-Timestamp": timestamp,
      },
      ...(body ? { body: bodyStr } : {}),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OVH API ${method} ${path} failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<T>;
  }

  private sign(method: string, url: string, body: string, timestamp: string): string {
    const toSign = [this.appSecret, this.consumerKey, method, url, body, timestamp].join("+");
    const hash = createHash("sha1").update(toSign).digest("hex");
    return `$1$${hash}`;
  }

  public async addRecord(subdomain: string): Promise<DnsProvisionResult> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const existing = await this.findRecordIds(zone, zoneSubdomain);

    if (existing.length > 0) {
      // Record already exists — check if target matches
      const status = await this.checkRecord(subdomain);
      return { provisioned: true, status };
    }

    // DNS CNAME target must end with a dot
    const targetWithDot = this.target.endsWith(".") ? this.target : `${this.target}.`;

    await this.request("POST", `/domain/zone/${zone}/record`, {
      fieldType: "CNAME",
      subDomain: zoneSubdomain,
      target: targetWithDot,
      ttl: 3600,
    });

    await this.refreshZone(zone);

    return { provisioned: true, status: "active" };
  }

  public async removeRecord(subdomain: string): Promise<void> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const ids = await this.findRecordIds(zone, zoneSubdomain);

    for (const id of ids) {
      await this.request("DELETE", `/domain/zone/${zone}/record/${id}`);
    }

    if (ids.length > 0) {
      await this.refreshZone(zone);
    }
  }

  public async checkRecord(subdomain: string): Promise<DnsRecordStatus> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const ids = await this.findRecordIds(zone, zoneSubdomain);
    if (ids.length === 0) return "pending";

    const record = await this.request<OvhDnsRecord>("GET", `/domain/zone/${zone}/record/${ids[0]}`);
    const normalizedTarget = record.target.replace(/\.$/, "");
    const normalizedExpected = this.target.replace(/\.$/, "");

    if (normalizedTarget === normalizedExpected) {
      return "active";
    }

    return "error";
  }

  private async findRecordIds(zone: string, zoneSubdomain: string): Promise<number[]> {
    return this.request<number[]>(
      "GET",
      `/domain/zone/${zone}/record?subDomain=${encodeURIComponent(zoneSubdomain)}&fieldType=CNAME`,
    );
  }

  private async refreshZone(zone: string): Promise<void> {
    await this.request("POST", `/domain/zone/${zone}/refresh`);
  }
}
