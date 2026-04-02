/**
 * Subdomains reserved for infrastructure, services, or future use.
 * These cannot be claimed as tenant subdomains.
 */
export const RESERVED_SUBDOMAINS = new Set([
  // Infrastructure
  "licensing",
  "api",
  "app",
  "admin",
  "status",
  "health",
  "healthz",

  // Email / security
  "mail",
  "smtp",
  "imap",
  "pop",
  "autoconfig",
  "autodiscover",

  // Auth / SSO
  "auth",
  "login",
  "sso",
  "oauth",
  "connect",

  // Dev / ops
  "staging",
  "preprod",
  "dev",
  "test",
  "demo",
  "sandbox",
  "preview",

  // Documentation / support
  "doc",
  "docs",
  "help",
  "support",
  "faq",
  "blog",

  // Common reserved
  "www",
  "cdn",
  "assets",
  "static",
  "media",
  "files",

  // Monitoring / observability
  "grafana",
  "sentry",
  "metrics",
  "logs",

  // Misc
  "billing",
  "checkout",
  "dashboard",
  "console",
  "internal",
  "root",
  "system",
]);

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain.toLowerCase());
}
