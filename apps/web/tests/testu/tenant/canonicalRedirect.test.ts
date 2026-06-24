import { buildCanonicalRedirectUrl, resolveCanonicalTargetHost } from "@/lib/utils/canonicalRedirect";

const ROOT = "roadmaps-faciles.fr";

describe("resolveCanonicalTargetHost", () => {
  it("returns null when the flag is off", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: false, customDomain: "acme.com" },
        "acme.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBeNull();
  });

  it("returns null when no custom domain is set", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: true, customDomain: null },
        "acme.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBeNull();
  });

  it("returns the sanitized target host for a canonical subdomain", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: true, customDomain: "feedback.acme.com" },
        "acme.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBe("feedback.acme.com");
  });

  it("returns null when already on the custom domain (anti-loop)", () => {
    expect(
      resolveCanonicalTargetHost({ forceCustomDomainRedirect: true, customDomain: "acme.com" }, "acme.com", ROOT),
    ).toBeNull();
  });

  it("treats www and apex as the same host (no redirect)", () => {
    expect(
      resolveCanonicalTargetHost({ forceCustomDomainRedirect: true, customDomain: "acme.com" }, "www.acme.com", ROOT),
    ).toBeNull();
  });

  it("compares hosts case-insensitively", () => {
    expect(
      resolveCanonicalTargetHost({ forceCustomDomainRedirect: true, customDomain: "acme.com" }, "ACME.COM", ROOT),
    ).toBeNull();
  });

  it("ignores a trailing dot on the incoming host", () => {
    expect(
      resolveCanonicalTargetHost({ forceCustomDomainRedirect: true, customDomain: "acme.com" }, "acme.com.", ROOT),
    ).toBeNull();
  });

  it("ignores the port on the incoming host", () => {
    expect(
      resolveCanonicalTargetHost({ forceCustomDomainRedirect: true, customDomain: "acme.com" }, "acme.com:3000", ROOT),
    ).toBeNull();
  });

  it("never targets a platform host (kills inter-tenant ping-pong)", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: true, customDomain: "b.roadmaps-faciles.fr" },
        "a.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBeNull();
  });

  it("never targets the platform root domain itself", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: true, customDomain: "roadmaps-faciles.fr" },
        "a.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBeNull();
  });

  it("strips a path accidentally stored in the custom domain", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: true, customDomain: "feedback.acme.com/roadmap" },
        "acme.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBe("feedback.acme.com");
  });

  it("returns null when the stored custom domain is unparseable", () => {
    expect(
      resolveCanonicalTargetHost(
        { forceCustomDomainRedirect: true, customDomain: "not a domain" },
        "acme.roadmaps-faciles.fr",
        ROOT,
      ),
    ).toBeNull();
  });
});

describe("buildCanonicalRedirectUrl", () => {
  it("preserves the path", () => {
    expect(buildCanonicalRedirectUrl("feedback.acme.com", "/board/x", "")).toBe("https://feedback.acme.com/board/x");
  });

  it("preserves the query string", () => {
    expect(buildCanonicalRedirectUrl("acme.com", "/board/x", "?view=list&page=2")).toBe(
      "https://acme.com/board/x?view=list&page=2",
    );
  });

  it("does not let a // pathname hijack the target host (open-redirect)", () => {
    expect(buildCanonicalRedirectUrl("acme.com", "//evil.com", "")).toBe("https://acme.com/evil.com");
  });

  it("does not let a backslash pathname hijack the target host", () => {
    expect(buildCanonicalRedirectUrl("acme.com", "\\\\evil.com", "")).toBe("https://acme.com/evil.com");
  });
});
