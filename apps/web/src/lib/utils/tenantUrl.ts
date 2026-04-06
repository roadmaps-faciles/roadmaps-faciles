import "server-only";

import { config } from "@/config";

export function getTenantCanonicalOrigin(subdomain: string, customDomain?: null | string): string {
  const protocol = config.host.startsWith("https") ? "https" : "http";
  const port = config.host.match(/:(\d+)$/)?.[1];

  if (customDomain) {
    return `${protocol}://${customDomain}`;
  }

  return `${protocol}://${subdomain}.${config.rootDomain}${port ? `:${port}` : ""}`;
}
