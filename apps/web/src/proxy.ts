import { type NextRequest, NextResponse } from "next/server";

import { responseWithAnonymousId } from "@/utils/anonymousId/responseWithAnonymousId";
import { buildCanonicalRedirectUrl } from "@/utils/canonicalRedirect";
import { DIRTY_DOMAIN_HEADER } from "@/utils/dirtyDomain/config";
import { getDomainPathname, pathnameDirtyCheck } from "@/utils/dirtyDomain/pathnameDirtyCheck";

import { config as appConfig } from "./config";

const CORRELATION_ID_HEADER = "x-correlation-id";

function withCorrelationId(req: NextRequest, response: NextResponse): NextResponse {
  const correlationId = req.headers.get(CORRELATION_ID_HEADER) || crypto.randomUUID();
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  response.headers.set("x-request-id", correlationId);
  return response;
}

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Ensure correlation ID is present on the incoming request headers for downstream consumers
  const correlationId = req.headers.get(CORRELATION_ID_HEADER) || crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-search", url.search);

  // Ensure x-forwarded-proto is set (missing in local dev without reverse proxy)
  if (!requestHeaders.has("x-forwarded-proto")) {
    requestHeaders.set("x-forwarded-proto", url.protocol.replace(":", ""));
  }

  // Skip proxy rewriting for auth and 2FA API routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/ee/webauthn") ||
    pathname.startsWith("/api/ee/otp") ||
    pathname.startsWith("/api/ee/2fa")
  ) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return withCorrelationId(req, response);
  }

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  // Derrière un reverse proxy (Traefik/Coolify) le header `host` brut peut être l'hôte interne
  // (ex: localhost:3000), le vrai domaine étant dans `x-forwarded-host`. Lire x-forwarded-host
  // en priorité (comme getDomainFromHost et la factory NextAuth) sinon les requêtes du root
  // domain sont mal routées vers la route tenant `[domain]` (404 / soft-nav cassée).
  // Normalize localhost subdomains to rootDomain (supports any port, not just :3000)
  let hostname = (req.headers.get("x-forwarded-host") || req.headers.get("host"))!.replace(
    /\.localhost:\d+$/,
    `.${appConfig.rootDomain}`,
  );

  // Normalize subdomains of additional root domains to canonical rootDomain
  // e.g. e2e.ducmaxv2.ts.sagetlethias.tech:3000 → e2e.localhost:3000
  for (const altRoot of appConfig.additionalRootDomains) {
    if (hostname.endsWith(`.${altRoot}`)) {
      const subdomain = hostname.slice(0, -(altRoot.length + 1));
      hostname = `${subdomain}.${appConfig.rootDomain}`;
      break;
    }
  }

  // Canonical redirect: platform default domain → configured site URL
  // When PLATFORM_DOMAIN is set (e.g. "scalingo.io"), requests on that domain are redirected.
  // Skips the case where rootDomain itself is on the platform domain (avoids redirect loops), and API routes (health checks).
  if (appConfig.platformDomain && !pathname.startsWith("/api/")) {
    const hostnameWithoutPort = hostname.replace(/:\d+$/, "");
    const rootDomainWithoutPort = appConfig.rootDomain.replace(/:\d+$/, "");
    const rootOnPlatformDomain = rootDomainWithoutPort.endsWith(`.${appConfig.platformDomain}`);
    if (!rootOnPlatformDomain && hostnameWithoutPort.endsWith(`.${appConfig.platformDomain}`)) {
      const redirectUrl = new URL(`${pathname}${url.search}`, appConfig.host);
      return withCorrelationId(req, NextResponse.redirect(redirectUrl, 301));
    }
  }

  // experimental: support for Chrome DevTools
  if (req.url.includes("/.well-known/appspecific/com.chrome.devtools.json") && appConfig.env === "dev") {
    return NextResponse.json({
      workspace: {
        root: import.meta.url.replace("file://", "").replace("src/proxy.ts", ""),
        uuid: crypto.randomUUID(),
      },
      deployment: {
        url: hostname,
      },
    });
  }

  const isDirtyDomain = pathnameDirtyCheck(pathname);
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // rewrites for app pages
  const isRootDomain = hostname === appConfig.rootDomain || appConfig.additionalRootDomains.includes(hostname);
  if (isRootDomain) {
    requestHeaders.set(DIRTY_DOMAIN_HEADER, isDirtyDomain ? getDomainPathname(pathname) : "false");
    return withCorrelationId(
      req,
      responseWithAnonymousId(
        req,
        NextResponse.rewrite(new URL(path, req.url), {
          request: { headers: requestHeaders },
        }),
      ),
    );
  }

  // Canonical redirect (308) : un tenant peut forcer la redirection de son subdomain vers son
  // customDomain. Le proxy (Edge) n'a pas Prisma/cache, donc le lookup est delegue a une route Node
  // (cache 1h). On ne paie ce hop que sur les GET de navigation d'un subdomain tenant (jamais sur
  // /api, /admin, /embed, ni sur les requetes RSC/prefetch). Fail-open : toute erreur => routing
  // normal. Le 308 emis ici est un vrai redirect HTTP (vs le meta-refresh soft d'un redirect throw
  // depuis un layout sous le <Suspense> du root layout).
  const isTenantSubdomain = hostname.endsWith(`.${appConfig.rootDomain}`);
  const isRedirectablePath =
    !pathname.startsWith("/api") && !pathname.startsWith("/admin") && !pathname.startsWith("/embed");
  const isPlainNavigation = req.method === "GET" && !req.headers.get("rsc") && !req.headers.get("next-router-prefetch");
  if (isTenantSubdomain && isRedirectablePath && isPlainNavigation) {
    try {
      const lookup = await fetch(
        new URL(`/api/internal/canonical-redirect?host=${encodeURIComponent(hostname)}`, appConfig.host),
      );
      if (lookup.ok) {
        const { target } = (await lookup.json()) as { target: null | string };
        if (target) {
          return withCorrelationId(
            req,
            NextResponse.redirect(buildCanonicalRedirectUrl(target, pathname, url.search), 308),
          );
        }
      }
    } catch {
      // fail-open : le visiteur reste sur le subdomain, le routing normal continue.
    }
  }

  // Custom domains in dev: strip port so [domain] param matches DB customDomain without port.
  // Subdomains keep the port (needed for getTenantSubdomain matching against rootDomain).
  if (!hostname.endsWith(`.${appConfig.rootDomain}`)) {
    hostname = hostname.replace(/:(\d+)$/, "");
  }

  // rewrite everything else to `/[domain] dynamic route
  return withCorrelationId(
    req,
    responseWithAnonymousId(
      req,
      NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url), {
        request: { headers: requestHeaders },
      }),
    ),
  );
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    // "/((?!api|_next/|_static|[\\w-]+\\.\\w+).*)",
    "/((?!api|_next/|_static|img/).*)",
    // include api/auth for next-auth and 2FA API routes
    "/api/auth/:path*",
    "/api/ee/webauthn/:path*",
    "/api/ee/otp/:path*",
    "/api/ee/2fa/:path*",
  ],
};
