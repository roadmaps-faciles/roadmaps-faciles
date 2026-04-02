import { computeDnsNames } from "@/lib/ee/dns-provider/dnsUtils";

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
    dnsProvider: {
      zoneName: "",
    },
  },
}));

// We need to dynamically update the mock config between tests
const { config } = await import("@/config");
const mutableConfig = config as { rootDomain: string; dnsProvider: { zoneName: string } };

describe("computeDnsNames", () => {
  describe("without DNS_ZONE_NAME (default)", () => {
    beforeEach(() => {
      mutableConfig.rootDomain = "site.fr";
      mutableConfig.dnsProvider.zoneName = "";
    });

    it("uses rootDomain as zone", () => {
      const result = computeDnsNames("tenant");
      expect(result).toEqual({ zone: "site.fr", zoneSubdomain: "tenant" });
    });

    it("strips port from rootDomain", () => {
      mutableConfig.rootDomain = "localhost:3000";
      const result = computeDnsNames("tenant");
      expect(result).toEqual({ zone: "localhost", zoneSubdomain: "tenant" });
    });
  });

  describe("with DNS_ZONE_NAME matching rootDomain", () => {
    it("uses zone as-is when zone equals rootDomain", () => {
      mutableConfig.rootDomain = "site.fr";
      mutableConfig.dnsProvider.zoneName = "site.fr";

      const result = computeDnsNames("tenant");
      expect(result).toEqual({ zone: "site.fr", zoneSubdomain: "tenant" });
    });
  });

  describe("with nested subdomains (rootDomain != zone)", () => {
    beforeEach(() => {
      mutableConfig.rootDomain = "roadmaps.site.fr";
      mutableConfig.dnsProvider.zoneName = "site.fr";
    });

    it("computes zone-relative subdomain", () => {
      const result = computeDnsNames("tenant");
      expect(result).toEqual({ zone: "site.fr", zoneSubdomain: "tenant.roadmaps" });
    });

    it("works with deeper nesting", () => {
      mutableConfig.rootDomain = "app.roadmaps.site.fr";
      mutableConfig.dnsProvider.zoneName = "site.fr";

      const result = computeDnsNames("tenant");
      expect(result).toEqual({ zone: "site.fr", zoneSubdomain: "tenant.app.roadmaps" });
    });
  });

  describe("fallback when zone doesn't match rootDomain", () => {
    it("falls back to rootDomain when zone doesn't match suffix", () => {
      mutableConfig.rootDomain = "roadmaps.other.fr";
      mutableConfig.dnsProvider.zoneName = "site.fr";

      const result = computeDnsNames("tenant");
      expect(result).toEqual({ zone: "roadmaps.other.fr", zoneSubdomain: "tenant" });
    });
  });
});
