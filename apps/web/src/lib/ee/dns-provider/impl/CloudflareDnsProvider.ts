import { config } from "@/config";

import { computeDnsNames } from "../dnsUtils";
import { type DnsProvisionResult, type DnsRecordStatus, type IDnsProvider } from "../IDnsProvider";

const CLOUDFLARE_BASE_URL = "https://api.cloudflare.com/client/v4";

interface CloudflareDnsRecord {
  content: string;
  id: string;
  name: string;
  type: string;
}

interface CloudflareListResponse<T> {
  result: T[];
  success: boolean;
}

interface CloudflareZone {
  id: string;
  name: string;
}

export class CloudflareDnsProvider implements IDnsProvider {
  private cachedZoneId: null | string = null;

  private get target() {
    return config.dnsProvider.target;
  }

  private get email() {
    return config.dnsProvider.cloudflare.email;
  }

  private get apiKey() {
    return config.dnsProvider.cloudflare.apiKey;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${CLOUDFLARE_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Email": this.email,
        "X-Auth-Key": this.apiKey,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudflare API ${method} ${path} failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<T>;
  }

  private async getZoneId(zone: string): Promise<string> {
    if (this.cachedZoneId) return this.cachedZoneId;

    const data = await this.request<CloudflareListResponse<CloudflareZone>>(
      "GET",
      `/zones?name=${encodeURIComponent(zone)}`,
    );

    if (!data.result.length) {
      throw new Error(`Cloudflare zone not found for domain: ${zone}`);
    }

    this.cachedZoneId = data.result[0].id;
    return this.cachedZoneId;
  }

  public async addRecord(subdomain: string): Promise<DnsProvisionResult> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const zoneId = await this.getZoneId(zone);
    const fqdn = `${zoneSubdomain}.${zone}`;

    const existing = await this.findRecord(zoneId, fqdn);
    if (existing) {
      const status = existing.content === this.target ? "active" : "error";
      return { provisioned: true, status };
    }

    await this.request("POST", `/zones/${zoneId}/dns_records`, {
      type: "CNAME",
      name: fqdn,
      content: this.target,
      ttl: 3600,
      proxied: false,
    });

    return { provisioned: true, status: "active" };
  }

  public async removeRecord(subdomain: string): Promise<void> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const zoneId = await this.getZoneId(zone);
    const fqdn = `${zoneSubdomain}.${zone}`;

    const record = await this.findRecord(zoneId, fqdn);
    if (!record) return;

    await this.request("DELETE", `/zones/${zoneId}/dns_records/${record.id}`);
  }

  public async checkRecord(subdomain: string): Promise<DnsRecordStatus> {
    const { zone, zoneSubdomain } = computeDnsNames(subdomain);
    const zoneId = await this.getZoneId(zone);
    const fqdn = `${zoneSubdomain}.${zone}`;

    const record = await this.findRecord(zoneId, fqdn);
    if (!record) return "pending";

    return record.content === this.target ? "active" : "error";
  }

  private async findRecord(zoneId: string, fqdn: string): Promise<CloudflareDnsRecord | null> {
    const data = await this.request<CloudflareListResponse<CloudflareDnsRecord>>(
      "GET",
      `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(fqdn)}`,
    );

    return data.result[0] ?? null;
  }
}
