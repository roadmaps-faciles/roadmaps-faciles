import { enforceCanonicalRedirect } from "@/lib/utils/canonicalRedirect";

const mockPermanentRedirect = vi.fn();
const mockGetDomainFromHost = vi.fn();
const mockHeaders = { get: vi.fn() };

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ permanentRedirect: (url: string) => mockPermanentRedirect(url) }));
vi.mock("next/headers", () => ({ headers: () => Promise.resolve(mockHeaders) }));
vi.mock("@/config", () => ({ config: { rootDomain: "roadmaps-faciles.fr" } }));
vi.mock("@/utils/tenant", () => ({ getDomainFromHost: () => mockGetDomainFromHost() }));

describe("enforceCanonicalRedirect", () => {
  beforeEach(() => {
    mockPermanentRedirect.mockReset();
    mockGetDomainFromHost.mockReset();
    mockGetDomainFromHost.mockResolvedValue("acme.roadmaps-faciles.fr");
    mockHeaders.get.mockReset();
    mockHeaders.get.mockImplementation((key: string) => (key === "x-pathname" ? "/board/x" : ""));
  });

  it("does not redirect when the flag is off", async () => {
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: false, customDomain: "acme.com" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("does not redirect when no custom domain is set", async () => {
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: null });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("redirects the canonical subdomain to the custom domain, preserving the path", async () => {
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "feedback.acme.com" });
    expect(mockPermanentRedirect).toHaveBeenCalledWith("https://feedback.acme.com/board/x");
  });

  it("preserves the query string", async () => {
    mockHeaders.get.mockImplementation((key: string) => (key === "x-pathname" ? "/board/x" : "?view=list&page=2"));
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "acme.com" });
    expect(mockPermanentRedirect).toHaveBeenCalledWith("https://acme.com/board/x?view=list&page=2");
  });

  it("does not redirect when already on the custom domain (anti-loop)", async () => {
    mockGetDomainFromHost.mockResolvedValue("acme.com");
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "acme.com" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("treats www and apex as the same host (no redirect)", async () => {
    mockGetDomainFromHost.mockResolvedValue("www.acme.com");
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "acme.com" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("compares hosts case-insensitively", async () => {
    mockGetDomainFromHost.mockResolvedValue("ACME.COM");
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "acme.com" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("ignores a trailing dot on the incoming host", async () => {
    mockGetDomainFromHost.mockResolvedValue("acme.com.");
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "acme.com" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("never redirects to a platform host (kills inter-tenant ping-pong)", async () => {
    mockGetDomainFromHost.mockResolvedValue("a.roadmaps-faciles.fr");
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "b.roadmaps-faciles.fr" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });

  it("strips a path accidentally stored in the custom domain (no loop)", async () => {
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "feedback.acme.com/roadmap" });
    expect(mockPermanentRedirect).toHaveBeenCalledWith("https://feedback.acme.com/board/x");
  });

  it("does not let a // pathname hijack the target host (open-redirect)", async () => {
    mockHeaders.get.mockImplementation((key: string) => (key === "x-pathname" ? "//evil.com" : ""));
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "acme.com" });
    expect(mockPermanentRedirect).toHaveBeenCalledWith("https://acme.com/evil.com");
  });

  it("does not redirect (nor crash) when the stored custom domain is unparseable", async () => {
    await enforceCanonicalRedirect({ forceCustomDomainRedirect: true, customDomain: "not a domain" });
    expect(mockPermanentRedirect).not.toHaveBeenCalled();
  });
});
