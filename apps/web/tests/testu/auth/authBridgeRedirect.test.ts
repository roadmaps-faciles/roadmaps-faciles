import {
  buildBridgeCallbackUrl,
  buildBridgeRedirectUrl,
  extractSubdomain,
  isSubdomainOrRootHost,
  parseRedirectUrl,
} from "@/app/(default)/api/auth-bridge/authBridgeRedirect";

describe("authBridgeRedirect", () => {
  describe("parseRedirectUrl", () => {
    it.each([
      ["https://tenant.example.com/", "https:"],
      ["http://tenant.example.com/board", "http:"],
      ["https://example.com:3000/path?q=1", "https:"],
    ])("accepts http/https URL %s", (input, expectedProtocol) => {
      const parsed = parseRedirectUrl(input);
      expect(parsed).toBeInstanceOf(URL);
      expect(parsed?.protocol).toBe(expectedProtocol);
    });

    it.each([
      ["javascript:alert(1)"],
      ["data:text/html,<script>alert(1)</script>"],
      ["file:///etc/passwd"],
      ["ftp://example.com/"],
    ])("rejects non-http(s) protocol %s", input => {
      expect(parseRedirectUrl(input)).toBeNull();
    });

    it.each([["//evil.com/"], ["/relative/path"], ["not a url"], ["evil.com"]])(
      "rejects unparseable / protocol-relative / relative %s",
      input => {
        expect(parseRedirectUrl(input)).toBeNull();
      },
    );

    it.each([[null], [undefined], [""]])("rejects empty value %s", input => {
      expect(parseRedirectUrl(input)).toBeNull();
    });
  });

  describe("isSubdomainOrRootHost", () => {
    const rootHost = "roadmaps-faciles.fr";

    it("accepts the root host itself", () => {
      expect(isSubdomainOrRootHost(new URL("https://roadmaps-faciles.fr/"), rootHost)).toBe(true);
    });

    it("accepts a subdomain of the root host", () => {
      expect(isSubdomainOrRootHost(new URL("https://acme.roadmaps-faciles.fr/board"), rootHost)).toBe(true);
    });

    it("accepts a nested subdomain of the root host", () => {
      expect(isSubdomainOrRootHost(new URL("https://a.b.roadmaps-faciles.fr/"), rootHost)).toBe(true);
    });

    it.each([["https://evil.com/"], ["https://roadmaps-faciles.fr.evil.com/"], ["https://notroadmaps-faciles.fr/"]])(
      "rejects external host %s (open redirect)",
      input => {
        expect(isSubdomainOrRootHost(new URL(input), rootHost)).toBe(false);
      },
    );

    it("matches on host (with port), so port mismatch is not a subdomain", () => {
      const rootHostWithPort = "localhost:3000";
      expect(isSubdomainOrRootHost(new URL("http://localhost:3000/"), rootHostWithPort)).toBe(true);
      expect(isSubdomainOrRootHost(new URL("http://acme.localhost:3000/"), rootHostWithPort)).toBe(true);
      expect(isSubdomainOrRootHost(new URL("http://acme.localhost:4000/"), rootHostWithPort)).toBe(false);
    });
  });

  describe("extractSubdomain", () => {
    it("extracts the subdomain from a tenant host", () => {
      expect(extractSubdomain(new URL("https://acme.roadmaps-faciles.fr/"), "roadmaps-faciles.fr")).toBe("acme");
    });

    it("strips the port when present", () => {
      expect(extractSubdomain(new URL("http://acme.localhost:3000/"), "localhost:3000")).toBe("acme");
    });

    it("returns null for the root host itself (not a strict subdomain)", () => {
      expect(extractSubdomain(new URL("https://roadmaps-faciles.fr/"), "roadmaps-faciles.fr")).toBeNull();
    });

    it("returns null for an external host (custom domain candidate)", () => {
      expect(extractSubdomain(new URL("https://custom.example.com/"), "roadmaps-faciles.fr")).toBeNull();
    });
  });

  describe("buildBridgeCallbackUrl", () => {
    it("builds a relative same-host bridge URL with encoded redirect param", () => {
      const result = buildBridgeCallbackUrl("https://acme.example.com/board", null);
      expect(result).toBe("/api/auth-bridge?redirect=https%3A%2F%2Facme.example.com%2Fboard");
      expect(result.startsWith("/")).toBe(true);
      expect(result.startsWith("//")).toBe(false);
    });

    it("propagates the action param when present", () => {
      const result = buildBridgeCallbackUrl("https://acme.example.com/", "signup");
      const params = new URLSearchParams(result.split("?")[1]);
      expect(params.get("redirect")).toBe("https://acme.example.com/");
      expect(params.get("action")).toBe("signup");
    });

    it("omits the action param when null", () => {
      const result = buildBridgeCallbackUrl("https://acme.example.com/", null);
      expect(new URLSearchParams(result.split("?")[1]).has("action")).toBe(false);
    });

    it("does not propagate arbitrary params from the original redirect query string", () => {
      // Only `redirect` (and optional `action`) survive; injected params are dropped.
      const result = buildBridgeCallbackUrl("https://acme.example.com/?evil=1&token=leak", null);
      const params = new URLSearchParams(result.split("?")[1]);
      expect([...params.keys()]).toEqual(["redirect"]);
    });
  });

  describe("buildBridgeRedirectUrl", () => {
    it("forces the path to /login and sets the bridge_token", () => {
      const parsed = new URL("https://acme.example.com/board/123");
      const url = buildBridgeRedirectUrl(parsed, "tok-abc", null);
      expect(url.pathname).toBe("/login");
      expect(url.host).toBe("acme.example.com");
      expect(url.searchParams.get("bridge_token")).toBe("tok-abc");
    });

    it("propagates the original target as `next`", () => {
      const parsed = new URL("https://acme.example.com/board/123?tab=open");
      const url = buildBridgeRedirectUrl(parsed, "tok-abc", null);
      expect(url.searchParams.get("next")).toBe("/board/123?tab=open");
    });

    it("does not set `next` when the original target is the root path", () => {
      const parsed = new URL("https://acme.example.com/");
      const url = buildBridgeRedirectUrl(parsed, "tok-abc", null);
      expect(url.searchParams.has("next")).toBe(false);
    });

    it("does not set `next` when the original target is /login already", () => {
      const parsed = new URL("https://acme.example.com/login");
      const url = buildBridgeRedirectUrl(parsed, "tok-abc", null);
      expect(url.searchParams.has("next")).toBe(false);
    });

    it("sets bridge_signup when action is signup", () => {
      const parsed = new URL("https://acme.example.com/");
      const url = buildBridgeRedirectUrl(parsed, "tok-abc", "signup");
      expect(url.searchParams.get("bridge_signup")).toBe("1");
    });

    it("does not set bridge_signup for a non-signup action", () => {
      const parsed = new URL("https://acme.example.com/");
      const url = buildBridgeRedirectUrl(parsed, "tok-abc", "whatever");
      expect(url.searchParams.has("bridge_signup")).toBe(false);
    });
  });
});
