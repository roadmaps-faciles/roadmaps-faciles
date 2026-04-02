import { type NextRequest, NextResponse } from "next/server";

import { config } from "@/config";
import { createBridgeToken } from "@/lib/authBridge";
import { auth } from "@/lib/next-auth/auth";
import { tenantRepo, userOnTenantRepo } from "@/lib/repo";

const getRequestBaseUrl = (request: NextRequest) => {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(config.host).host;
  const proto = request.headers.get("x-forwarded-proto") || new URL(config.host).protocol.replace(":", "");
  return `${proto}://${host}`;
};

/**
 * Resolve the tenant from the redirect URL (subdomain or custom domain).
 */
async function resolveTenantFromUrl(parsedUrl: URL, rootHost: string) {
  const isSubdomain = parsedUrl.host !== rootHost && parsedUrl.host.endsWith(`.${rootHost}`);
  if (isSubdomain) {
    const subdomain = parsedUrl.host.replace(`.${rootHost}`, "").replace(/:\d+$/, "");
    return tenantRepo.findBySubdomain(subdomain);
  }
  return tenantRepo.findByCustomDomain(parsedUrl.hostname);
}

export const GET = async (request: NextRequest) => {
  const baseUrl = getRequestBaseUrl(request);
  const rootUrl = (path = "/") => new URL(path, baseUrl);

  const redirectUrl = request.nextUrl.searchParams.get("redirect");
  const action = request.nextUrl.searchParams.get("action"); // "signup" for explicit bridge signup

  if (!redirectUrl) {
    return NextResponse.redirect(rootUrl());
  }

  // Validate redirect URL to prevent open redirect
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(redirectUrl);
  } catch {
    return NextResponse.redirect(rootUrl());
  }

  // Only allow http/https protocols
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.redirect(rootUrl());
  }

  // Allow redirect to same host, tenant subdomains, or registered custom domains
  const rootHost = rootUrl().host;
  const isSubdomainHost = parsedUrl.host === rootHost || parsedUrl.host.endsWith(`.${rootHost}`);
  const isCustomDomainHost = !isSubdomainHost && !!(await tenantRepo.findByCustomDomain(parsedUrl.hostname));
  if (!isSubdomainHost && !isCustomDomainHost) {
    return NextResponse.redirect(rootUrl());
  }

  const session = await auth();

  if (!session?.user?.uuid) {
    // Not logged in — redirect to root login so user can authenticate first
    return NextResponse.redirect(rootUrl("/login"));
  }

  // Resolve the target tenant
  const tenant = await resolveTenantFromUrl(parsedUrl, rootHost);

  if (tenant) {
    // Check if user is already a member of this tenant
    const membership = await userOnTenantRepo.findMembership(session.user.uuid, tenant.id);

    if (!membership && action !== "signup") {
      // Not a member and not explicitly signing up → redirect to tenant login with hint
      parsedUrl.searchParams.set("from", "root");
      return NextResponse.redirect(parsedUrl);
    }
  }

  // Member (or signup action) → issue bridge token
  const token = createBridgeToken(session.user.uuid);
  parsedUrl.searchParams.set("bridge_token", token);
  if (action === "signup") {
    parsedUrl.searchParams.set("bridge_signup", "1");
  }

  return NextResponse.redirect(parsedUrl);
};
