import {
  generateVerificationToken,
  getTxtRecordName,
  isDomainProtectedBy,
  isGouvDomain,
} from "@/lib/ee/domain-verification";

describe("domain-verification", () => {
  describe("generateVerificationToken", () => {
    it("generates a token with the correct prefix", () => {
      const token = generateVerificationToken();
      expect(token).toMatch(/^roadmaps-faciles-verify=[0-9a-f]{64}$/);
    });

    it("generates unique tokens", () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("getTxtRecordName", () => {
    it("prepends the verification subdomain", () => {
      expect(getTxtRecordName("example.com")).toBe("_roadmaps-faciles-verify.example.com");
    });

    it("works with subdomains", () => {
      expect(getTxtRecordName("sub.example.gouv.fr")).toBe("_roadmaps-faciles-verify.sub.example.gouv.fr");
    });
  });

  describe("isGouvDomain", () => {
    it("returns true for .gouv.fr domains", () => {
      expect(isGouvDomain("ademe.gouv.fr")).toBe(true);
      expect(isGouvDomain("sub.ademe.gouv.fr")).toBe(true);
    });

    it("returns false for non-.gouv.fr domains", () => {
      expect(isGouvDomain("example.com")).toBe(false);
      expect(isGouvDomain("example.fr")).toBe(false);
      expect(isGouvDomain("gouv.fr.evil.com")).toBe(false);
    });
  });

  describe("isDomainProtectedBy", () => {
    it("matches exact domain", () => {
      expect(isDomainProtectedBy("ademe.gouv.fr", "ademe.gouv.fr")).toBe(true);
    });

    it("matches subdomain of verified domain", () => {
      expect(isDomainProtectedBy("custom.ademe.gouv.fr", "ademe.gouv.fr")).toBe(true);
    });

    it("does not match unrelated domains", () => {
      expect(isDomainProtectedBy("example.com", "ademe.gouv.fr")).toBe(false);
    });

    it("does not match partial name overlaps", () => {
      expect(isDomainProtectedBy("notademe.gouv.fr", "ademe.gouv.fr")).toBe(false);
    });
  });
});
