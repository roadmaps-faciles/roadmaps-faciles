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
    // Pas auth : redirige vers /login en préservant l'URL bridge en callbackUrl
    // (relative, donc same-host → pas d'open redirect). Après login, NextAuth
    // redirect → revient sur /api/auth-bridge (cette fois authentifié), qui
    // termine le flow et redirige vers le tenant. Sans ça, après login on retombe
    // sur "/" du root et l'user doit naviguer manuellement vers le tenant.
    //
    // On reconstruit l'URL bridge à partir des params déjà validés (redirect +
    // action) au lieu de propager toute la query string, pour éviter qu'un
    // attaquant injecte des params parasites consommés ailleurs dans la chaîne.
    const preservedParams = new URLSearchParams({ redirect: redirectUrl });
    if (action) preservedParams.set("action", action);
    const bridgeUrl = `/api/auth-bridge?${preservedParams.toString()}`;
    const loginUrl = rootUrl("/login");
    loginUrl.searchParams.set("callbackUrl", bridgeUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Resolve the target tenant
  const tenant = await resolveTenantFromUrl(parsedUrl, rootHost);

  if (tenant && !session.user.isSuperAdmin) {
    // Check if user is already a member of this tenant (super admins bypass)
    const membership = await userOnTenantRepo.findMembership(session.user.uuid, tenant.id);

    if (!membership && action !== "signup") {
      // Not a member and not explicitly signing up → redirect to tenant login with hint
      parsedUrl.searchParams.set("from", "root");
      return NextResponse.redirect(parsedUrl);
    }
  }

  // Member (or signup action) → issue bridge token
  const token = createBridgeToken(session.user.uuid);

  // Force le path à /login pour que BridgeAutoLogin s'exécute (il est monté
  // uniquement sur le login page tenant). Préserve la destination d'origine en
  // `next` pour que l'user atterrisse où il s'attendait après le signin bridge.
  const originalTarget = parsedUrl.pathname + parsedUrl.search;
  const bridgeRedirectUrl = new URL("/login", parsedUrl);
  bridgeRedirectUrl.searchParams.set("bridge_token", token);
  if (action === "signup") {
    bridgeRedirectUrl.searchParams.set("bridge_signup", "1");
  }
  if (originalTarget !== "/" && originalTarget !== "/login") {
    bridgeRedirectUrl.searchParams.set("next", originalTarget);
  }

  return NextResponse.redirect(bridgeRedirectUrl);
};
