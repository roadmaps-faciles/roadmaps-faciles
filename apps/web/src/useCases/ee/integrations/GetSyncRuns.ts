import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IIntegrationSyncLogRepo, type SyncRunSummary } from "@/lib/repo/IIntegrationSyncLogRepo";

import { type UseCase } from "../../types";

export interface GetSyncRunsInput {
  integrationId: number;
  limit?: number;
  tenantId: number;
}

export type GetSyncRunsOutput = SyncRunSummary[];

export class GetSyncRuns implements UseCase<GetSyncRunsInput, GetSyncRunsOutput> {
  constructor(
    private readonly integrationRepo: IIntegrationRepo,
    private readonly syncLogRepo: IIntegrationSyncLogRepo,
  ) {}

  public async execute(input: GetSyncRunsInput): Promise<GetSyncRunsOutput> {
    const integration = await this.integrationRepo.findById(input.integrationId);
    if (!integration || integration.tenantId !== input.tenantId) {
      throw new Error("Integration not found");
    }

    return this.syncLogRepo.findSyncRuns(input.integrationId, input.limit);
  }
}
