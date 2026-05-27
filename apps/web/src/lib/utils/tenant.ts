import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { config } from "@/config";
import { type Tenant } from "@/lib/model/Tenant";
import { tenantRepo } from "@/lib/repo";
import { GetTenantForDomain, GetTenantForDomainNotFoundError } from "@/useCases/tenant/GetTenantForDomain";

export const getDomainFromHost = async (): Promise<string> => {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");

  if (!host) {
    throw new Error("No host header found");
  }

  // 0.0.0.0 binds all interfaces - normalize to localhost (Next.js dev default)
  if (host.startsWith("0.0.0.0")) {
    return host.replace("0.0.0.0", "localhost");
  }

  // Normalize additional root domains and their subdomains to canonical rootDomain
  if (config.additionalRootDomains.includes(host)) {
    return config.rootDomain;
  }
  for (const altRoot of config.additionalRootDomains) {
    if (host.endsWith(`.${altRoot}`)) {
      const subdomain = host.slice(0, -(altRoot.length + 1));
      return `${subdomain}.${config.rootDomain}`;
    }
  }

  return host;
};

export const getTenantFromDomain = async (domainParam: string): Promise<Tenant> => {
  const domain = decodeURIComponent(domainParam);
  const useCase = new GetTenantForDomain(tenantRepo);

  try {
    const tenant = await useCase.execute({ domain });
    return tenant;
  } catch (error) {
    if (error instanceof GetTenantForDomainNotFoundError) {
      notFound();
    }

    throw error;
  }
};

export const getTenantSubdomain = (domain: string): null | string =>
  domain.endsWith(`.${config.rootDomain}`) ? domain.replace(`.${config.rootDomain}`, "") : null;
