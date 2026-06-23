import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config", () => ({
  config: {
    host: "https://roadmaps-faciles.fr",
    rootDomain: "roadmaps-faciles.fr",
    additionalRootDomains: ["app.tailnet.ts.net"],
  },
}));

const { isTrustedAuthHost, toTrustedAuthUrl } = await import("@/lib/next-auth/trustedHost");
const { config } = await import("@/config");
const mutableConfig = config as {
  additionalRootDomains: string[];
  host: string;
  rootDomain: string;
};

describe("isTrustedAuthHost", () => {
  beforeEach(() => {
    mutableConfig.host = "https://roadmaps-faciles.fr";
    mutableConfig.rootDomain = "roadmaps-faciles.fr";
    mutableConfig.additionalRootDomains = ["app.tailnet.ts.net"];
  });

  it("trusts the canonical root host", () => {
    expect(isTrustedAuthHost("roadmaps-faciles.fr")).toBe(true);
  });

  it("trusts a tenant subdomain of the root domain", () => {
    expect(isTrustedAuthHost("foo.roadmaps-faciles.fr")).toBe(true);
  });

  it("trusts an additional root domain and its subdomains", () => {
    expect(isTrustedAuthHost("app.tailnet.ts.net")).toBe(true);
    expect(isTrustedAuthHost("foo.app.tailnet.ts.net")).toBe(true);
  });

  it("rejects an unrelated/spoofed host", () => {
    expect(isTrustedAuthHost("evil.com")).toBe(false);
  });

  it("rejects suffix-confusion hosts (no leading dot boundary)", () => {
    expect(isTrustedAuthHost("evilroadmaps-faciles.fr")).toBe(false);
    expect(isTrustedAuthHost("roadmaps-faciles.fr.evil.com")).toBe(false);
  });

  it("rejects a tenant custom domain (not ownership-verified)", () => {
    expect(isTrustedAuthHost("monorga.gouv.fr")).toBe(false);
  });

  it("handles a root host with a port (dev)", () => {
    mutableConfig.host = "http://localhost:3000";
    mutableConfig.rootDomain = "localhost:3000";
    expect(isTrustedAuthHost("localhost:3000")).toBe(true);
    expect(isTrustedAuthHost("foo.localhost:3000")).toBe(true);
    expect(isTrustedAuthHost("evil.com")).toBe(false);
  });
});

describe("toTrustedAuthUrl", () => {
  beforeEach(() => {
    mutableConfig.host = "https://roadmaps-faciles.fr";
    mutableConfig.rootDomain = "roadmaps-faciles.fr";
    mutableConfig.additionalRootDomains = ["app.tailnet.ts.net"];
  });

  it("keeps an URL already on the canonical host untouched", () => {
    const url = "https://roadmaps-faciles.fr/api/auth/callback/nodemailer?token=abc&email=a%40b.c";
    expect(toTrustedAuthUrl(url)).toBe(url);
  });

  it("keeps an URL on a trusted tenant subdomain untouched", () => {
    const url = "https://foo.roadmaps-faciles.fr/api/auth/callback/nodemailer?token=abc";
    expect(toTrustedAuthUrl(url)).toBe(url);
  });

  it("rewrites a spoofed host to the canonical host, preserving path + token query", () => {
    const url = "https://evil.com/api/auth/callback/nodemailer?token=secret&email=victim%40x.fr";
    expect(toTrustedAuthUrl(url)).toBe(
      "https://roadmaps-faciles.fr/api/auth/callback/nodemailer?token=secret&email=victim%40x.fr",
    );
  });

  it("rewrites an http spoofed host to the canonical https origin", () => {
    const url = "http://evil.com:8443/api/auth/callback/nodemailer?token=secret";
    expect(toTrustedAuthUrl(url)).toBe("https://roadmaps-faciles.fr/api/auth/callback/nodemailer?token=secret");
  });

  it("rewrites a tenant custom domain to the canonical host (no ownership proof)", () => {
    const url = "https://monorga.gouv.fr/api/auth/callback/nodemailer?token=secret";
    expect(toTrustedAuthUrl(url)).toBe("https://roadmaps-faciles.fr/api/auth/callback/nodemailer?token=secret");
  });

  it("keeps a verified custom domain untouched when passed as trustedCustomHost", () => {
    const url = "https://monorga.gouv.fr/api/auth/callback/nodemailer?token=secret";
    expect(toTrustedAuthUrl(url, "monorga.gouv.fr")).toBe(url);
  });

  it("still rewrites a host that does not match the passed trustedCustomHost", () => {
    const url = "https://evil.com/api/auth/callback/nodemailer?token=secret";
    expect(toTrustedAuthUrl(url, "monorga.gouv.fr")).toBe(
      "https://roadmaps-faciles.fr/api/auth/callback/nodemailer?token=secret",
    );
  });

  it("normalizes a 0.0.0.0 host as localhost (trusted in dev)", () => {
    mutableConfig.host = "http://localhost:3000";
    mutableConfig.rootDomain = "localhost:3000";
    const url = "http://0.0.0.0:3000/api/auth/callback/nodemailer?token=abc";
    expect(toTrustedAuthUrl(url)).toBe(url);
  });

  it("falls back to the canonical origin on an unparseable URL", () => {
    expect(toTrustedAuthUrl("not a url")).toBe("https://roadmaps-faciles.fr");
  });
});
