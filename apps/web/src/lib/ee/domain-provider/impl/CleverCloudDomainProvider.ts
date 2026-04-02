import { createHmac, randomBytes } from "node:crypto";

import { config } from "@/config";

import { type DomainStatus, type DomainType, type IDomainProvider } from "../IDomainProvider";

const API_BASE = "https://api.clever-cloud.com";

export class CleverCloudDomainProvider implements IDomainProvider {
  private get cc() {
    return config.domainProvider.clevercloud;
  }

  private signRequest(method: string, url: string): Record<string, string> {
    const nonce = randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params = new URLSearchParams({
      oauth_consumer_key: this.cc.consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA512",
      oauth_timestamp: timestamp,
      oauth_token: this.cc.token,
      oauth_version: "1.0",
    });

    // Sort parameters alphabetically
    const sortedParams = new URLSearchParams([...params.entries()].sort());
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams.toString())}`;

    const signingKey = `${encodeURIComponent(this.cc.consumerSecret)}&${encodeURIComponent(this.cc.tokenSecret)}`;
    const signature = createHmac("sha512", signingKey).update(baseString).digest("base64");

    return {
      Authorization: [
        `OAuth oauth_consumer_key="${encodeURIComponent(this.cc.consumerKey)}"`,
        `oauth_nonce="${encodeURIComponent(nonce)}"`,
        `oauth_signature="${encodeURIComponent(signature)}"`,
        `oauth_signature_method="HMAC-SHA512"`,
        `oauth_timestamp="${timestamp}"`,
        `oauth_token="${encodeURIComponent(this.cc.token)}"`,
        `oauth_version="1.0"`,
      ].join(", "),
    };
  }

  private async request(method: string, path: string): Promise<Response> {
    const url = `${API_BASE}${path}`;
    const headers = this.signRequest(method, url);
    return fetch(url, { method, headers });
  }

  public async addDomain(domain: string, _type: DomainType): Promise<void> {
    const fqdn = encodeURIComponent(domain);
    const response = await this.request("PUT", `/v2/applications/${this.cc.appId}/vhosts/${fqdn}`);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`CleverCloud addDomain failed (${response.status}): ${body}`);
    }
  }

  public async removeDomain(domain: string): Promise<void> {
    const fqdn = encodeURIComponent(domain);
    const response = await this.request("DELETE", `/v2/applications/${this.cc.appId}/vhosts/${fqdn}`);

    if (!response.ok && response.status !== 404) {
      const body = await response.text();
      throw new Error(`CleverCloud removeDomain failed (${response.status}): ${body}`);
    }
  }

  public async checkStatus(domain: string): Promise<DomainStatus> {
    const response = await this.request("GET", `/v2/applications/${this.cc.appId}/vhosts`);

    if (!response.ok) return "error";

    const vhosts = (await response.json()) as Array<{ fqdn: string }>;
    const found = vhosts.some(v => v.fqdn === domain);
    return found ? "active" : "pending";
  }
}
