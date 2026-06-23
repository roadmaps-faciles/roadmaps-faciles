import { describe, expect, it } from "vitest";

import { isDomainProtectedBy, isGouvDomain } from "@/lib/ee/domain-verification";

describe("isDomainProtectedBy", () => {
  it("matches the exact domain", () => {
    expect(isDomainProtectedBy("ademe.gouv.fr", "ademe.gouv.fr")).toBe(true);
  });

  it("matches a subdomain of the verified domain", () => {
    expect(isDomainProtectedBy("roadmaps.ademe.gouv.fr", "ademe.gouv.fr")).toBe(true);
    expect(isDomainProtectedBy("a.b.ademe.gouv.fr", "ademe.gouv.fr")).toBe(true);
  });

  it("rejects an unrelated domain", () => {
    expect(isDomainProtectedBy("evil.com", "ademe.gouv.fr")).toBe(false);
  });

  it("rejects suffix-confusion (no dot boundary)", () => {
    expect(isDomainProtectedBy("evilademe.gouv.fr", "ademe.gouv.fr")).toBe(false);
    expect(isDomainProtectedBy("ademe.gouv.fr.evil.com", "ademe.gouv.fr")).toBe(false);
  });

  it("does not treat the verified domain as a subdomain of the candidate (direction matters)", () => {
    expect(isDomainProtectedBy("ademe.gouv.fr", "roadmaps.ademe.gouv.fr")).toBe(false);
  });
});

describe("isGouvDomain", () => {
  it("detects .gouv.fr domains", () => {
    expect(isGouvDomain("ademe.gouv.fr")).toBe(true);
    expect(isGouvDomain("roadmaps.ademe.gouv.fr")).toBe(true);
  });

  it("rejects non-.gouv.fr domains", () => {
    expect(isGouvDomain("example.com")).toBe(false);
    expect(isGouvDomain("gouv.fr.evil.com")).toBe(false);
  });
});
