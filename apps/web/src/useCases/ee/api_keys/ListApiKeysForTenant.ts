import { z } from "zod";

import { type IApiKeyRepo } from "@/lib/repo/IApiKeyRepo";
import { type ApiKey } from "@/prisma/client";

import { type UseCase } from "../../types";

export const ListApiKeysForTenantInput = z.object({
  tenantId: z.number(),
});

export type ListApiKeysForTenantInput = z.infer<typeof ListApiKeysForTenantInput>;
export type ListApiKeysForTenantOutput = ApiKey[];

export class ListApiKeysForTenant implements UseCase<ListApiKeysForTenantInput, ListApiKeysForTenantOutput> {
  constructor(private readonly apiKeyRepo: IApiKeyRepo) {}

  public async execute(input: ListApiKeysForTenantInput): Promise<ListApiKeysForTenantOutput> {
    return this.apiKeyRepo.findAllForTenant(input.tenantId);
  }
}
