import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type TenantIntegration } from "@/prisma/client";

import { type UseCase } from "../../types";

export interface ListIntegrationsForTenantInput {
  tenantId: number;
}

export type ListIntegrationsForTenantOutput = TenantIntegration[];

export class ListIntegrationsForTenant implements UseCase<
  ListIntegrationsForTenantInput,
  ListIntegrationsForTenantOutput
> {
  constructor(private readonly integrationRepo: IIntegrationRepo) {}

  public async execute(input: ListIntegrationsForTenantInput): Promise<ListIntegrationsForTenantOutput> {
    return this.integrationRepo.findAllForTenant(input.tenantId);
  }
}
