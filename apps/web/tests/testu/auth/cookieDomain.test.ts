import { getCrossSubdomainCookieDomain } from "@/lib/next-auth/cookieDomain";

describe("getCrossSubdomainCookieDomain", () => {
  describe("root + subdomains : scope cross-subdomain", () => {
    it.each([
      ["roadmaps-faciles.fr", "roadmaps-faciles.fr"],
      ["tenant.roadmaps-faciles.fr", "roadmaps-faciles.fr"],
      ["a.b.roadmaps-faciles.fr", "roadmaps-faciles.fr"],
    ])("scope %s → .%s", (host, expected) => {
      expect(getCrossSubdomainCookieDomain(host, ["roadmaps-faciles.fr"])).toBe(`.${expected}`);
    });
  });

  describe("additional root domains", () => {
    it("scope tailscale subdomain → .ts.tailscale.tld", () => {
      expect(getCrossSubdomainCookieDomain("e2e.ts.tailscale.tld", ["roadmaps-faciles.fr", "ts.tailscale.tld"])).toBe(
        ".ts.tailscale.tld",
      );
    });
  });

  describe("ports stripped", () => {
    it("scope tenant.localdev.fr:3000 → .localdev.fr", () => {
      expect(getCrossSubdomainCookieDomain("tenant.localdev.fr:3000", ["localdev.fr:3000"])).toBe(".localdev.fr");
    });
  });

  describe("custom domains : undefined", () => {
    it("custom domain unknown → undefined", () => {
      expect(getCrossSubdomainCookieDomain("feedback.client.com", ["roadmaps-faciles.fr"])).toBeUndefined();
    });
  });

  describe("localhost / IP : undefined", () => {
    it.each([
      ["localhost:3000", ["localhost:3000"]],
      ["tenant.localhost:3000", ["localhost:3000"]],
      ["127.0.0.1:3000", ["127.0.0.1:3000"]],
      ["192.168.1.10", ["192.168.1.10"]],
    ])("scope %s → undefined", (host, roots) => {
      expect(getCrossSubdomainCookieDomain(host, roots)).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it.each([
      [null, ["roadmaps-faciles.fr"]],
      [undefined, ["roadmaps-faciles.fr"]],
      ["", ["roadmaps-faciles.fr"]],
    ])("falsy host (%s) → undefined", (host, roots) => {
      expect(getCrossSubdomainCookieDomain(host, roots)).toBeUndefined();
    });

    it("empty roots → undefined", () => {
      expect(getCrossSubdomainCookieDomain("anything.com", [])).toBeUndefined();
    });

    it("partial match suffix avoided (notroadmaps.com vs roadmaps.com)", () => {
      expect(getCrossSubdomainCookieDomain("notroadmaps.com", ["roadmaps.com"])).toBeUndefined();
    });
  });
});
