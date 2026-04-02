import { config } from "@/config";

import { type DomainStatus, type DomainType, type IDomainProvider } from "../IDomainProvider";

interface ScalingoDomain {
  id: string;
  letsencrypt_status: string;
  name: string;
}

export class ScalingoDomainProvider implements IDomainProvider {
  private bearerToken: null | string = null;
  private tokenExpiresAt = 0;
  private tokenRefreshPromise: null | Promise<string> = null;

  private get apiUrl() {
    return config.domainProvider.scalingo.apiUrl;
  }

  private get appId() {
    return config.domainProvider.scalingo.appId;
  }

  private async getToken(): Promise<string> {
    if (this.bearerToken && Date.now() < this.tokenExpiresAt) {
      return this.bearerToken;
    }

    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.exchangeToken();
    try {
      return await this.tokenRefreshPromise;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  private async exchangeToken(): Promise<string> {
    const response = await fetch("https://auth.scalingo.com/v1/tokens/exchange", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`:${config.domainProvider.scalingo.apiToken}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Scalingo token exchange failed: ${response.status}`);
    }

    const data = (await response.json()) as { token: string };
    this.bearerToken = data.token;
    // Token valid for 1h, refresh 5min before expiry
    this.tokenExpiresAt = Date.now() + 55 * 60 * 1000;
    return this.bearerToken;
  }

  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();
    return fetch(`${this.apiUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  public async addDomain(domain: string, _type: DomainType): Promise<void> {
    const response = await this.request(`/v1/apps/${this.appId}/domains`, {
      method: "POST",
      body: JSON.stringify({ domain: { name: domain } }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Scalingo addDomain failed (${response.status}): ${body}`);
    }
  }

  public async removeDomain(domain: string): Promise<void> {
    const domainId = await this.findDomainId(domain);
    if (!domainId) return;

    const response = await this.request(`/v1/apps/${this.appId}/domains/${domainId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Scalingo removeDomain failed (${response.status}): ${body}`);
    }
  }

  public async checkStatus(domain: string): Promise<DomainStatus> {
    const found = await this.findDomain(domain);
    if (!found) return "pending";

    switch (found.letsencrypt_status) {
      case "created":
        return "active";
      case "new":
      case "pending_dns":
        return "pending";
      default:
        return "error";
    }
  }

  private async findDomain(domain: string): Promise<null | ScalingoDomain> {
    const response = await this.request(`/v1/apps/${this.appId}/domains`);
    if (!response.ok) return null;

    const data = (await response.json()) as { domains: ScalingoDomain[] };
    return data.domains.find(d => d.name === domain) ?? null;
  }

  private async findDomainId(domain: string): Promise<null | string> {
    const found = await this.findDomain(domain);
    return found?.id ?? null;
  }
}
