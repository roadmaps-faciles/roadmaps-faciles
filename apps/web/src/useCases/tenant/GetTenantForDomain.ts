import { z } from "zod";

import { Tenant } from "@/lib/model/Tenant";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";
import { AppError } from "@/utils/error";
import { getTenantSubdomain } from "@/utils/tenant";

import { AbstractCachedUseCase } from "../AbstractCacheUseCase";

export const GetTenantForDomainInput = z.object({
  domain: z.string().min(1, "Domain is required"),
});

export type GetTenantForDomainInput = z.infer<typeof GetTenantForDomainInput>;
export type GetTenantForDomainOutput = Tenant;

declare module "../AbstractCacheUseCase" {
  namespace AbstractCachedUseCase {
    interface CacheToUseCase {
      GetTenantForDomain: GetTenantForDomain;
    }
  }
}

export class GetTenantForDomain extends AbstractCachedUseCase<GetTenantForDomainInput, GetTenantForDomainOutput> {
  public readonly cacheMasterKey = "GetTenantForDomain";
  public readonly defaultOptions = {
    revalidate: 60 * 60, // 1 hour
  };

  constructor(private readonly tenantRepo: ITenantRepo) {
    super();
  }

  public async cachedExecute(input: GetTenantForDomainInput): Promise<GetTenantForDomainOutput> {
    const { domain } = GetTenantForDomainInput.parse(input);
    const subdomain = getTenantSubdomain(domain);
    // Custom domains: strip port (in dev, host header includes :3000).
    // Subdomains keep the port since getTenantSubdomain matches against rootDomain which includes it.
    const customDomainLookup = domain.replace(/:(\d+)$/, "");
    const result = subdomain
      ? await this.tenantRepo.findBySubdomain(subdomain)
      : await this.tenantRepo.findByCustomDomain(customDomainLookup);
    if (!result) {
      throw new GetTenantForDomainNotFoundError(`Tenant not found for domain: ${domain}`);
    }

    const validationResult = Tenant.safeParse(result);
    if (!validationResult.success) {
      throw new GetTenantForDomainValidationError(
        `Tenant validation failed for domain: ${domain}, errors: ${JSON.stringify(validationResult.error.issues)}`,
      );
    }

    return validationResult.data;
  }
}

export class GetTenantForDomainError extends AppError {
  public readonly name: string = "GetTenantForDomainError";
  constructor(message: string) {
    super(message);
  }
}

export class GetTenantForDomainValidationError extends AppError {
  public readonly name: string = "GetTenantForDomainValidationError";
  constructor(message: string) {
    super(message);
  }
}
export class GetTenantForDomainNotFoundError extends AppError {
  public readonly name: string = "GetTenantForDomainNotFoundError";
  constructor(message: string) {
    super(message);
  }
}
