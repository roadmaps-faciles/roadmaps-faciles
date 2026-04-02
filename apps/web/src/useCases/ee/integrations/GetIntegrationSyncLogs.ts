import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IIntegrationSyncLogRepo } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IntegrationSyncLog } from "@/prisma/client";

import { type UseCase } from "../../types";

export interface GetIntegrationSyncLogsInput {
  integrationId: number;
  limit?: number;
  tenantId: number;
}

export type GetIntegrationSyncLogsOutput = IntegrationSyncLog[];

export class GetIntegrationSyncLogs implements UseCase<GetIntegrationSyncLogsInput, GetIntegrationSyncLogsOutput> {
  constructor(
    private readonly integrationRepo: IIntegrationRepo,
    private readonly syncLogRepo: IIntegrationSyncLogRepo,
  ) {}

  public async execute(input: GetIntegrationSyncLogsInput): Promise<GetIntegrationSyncLogsOutput> {
    const integration = await this.integrationRepo.findById(input.integrationId);
    if (!integration || integration.tenantId !== input.tenantId) {
      throw new Error("Integration not found");
    }

    return this.syncLogRepo.findRecentForIntegration(input.integrationId, input.limit);
  }
}
