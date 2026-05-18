import { type InboundChange, type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { type IIntegrationMappingRepo } from "@/lib/repo/IIntegrationMappingRepo";
import { type IIntegrationSyncLogRepo } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { type Prisma, type TenantIntegration } from "@/prisma/client";
import { IntegrationSyncStatus, SyncDirection, SyncLogStatus } from "@/prisma/enums";

import { type UseCase } from "../../types";

export interface ApplyInboundChangeInput {
  change: InboundChange;
  config: IntegrationConfig;
  integration: TenantIntegration;
  /** Optional sync run grouping (omit for reactive single-event applications) */
  syncRunId?: string;
}

export interface ApplyInboundChangeOutput {
  conflicts: number;
  errors: number;
  synced: number;
}

/**
 * Applies a single InboundChange to the local DB (create or update post + mapping).
 * Shared by SyncIntegration (full sync) and the webhook handler (reactive sync).
 */
export class ApplyInboundChange implements UseCase<ApplyInboundChangeInput, ApplyInboundChangeOutput> {
  constructor(
    private readonly integrationMappingRepo: IIntegrationMappingRepo,
    private readonly syncLogRepo: IIntegrationSyncLogRepo,
    private readonly postRepo: IPostRepo,
  ) {}

  public async execute(input: ApplyInboundChangeInput): Promise<ApplyInboundChangeOutput> {
    const { change, integration, config, syncRunId } = input;

    try {
      let existingMapping = await this.integrationMappingRepo.findByRemoteId(integration.id, change.remoteId);
      const sourceLabel = `${integration.name} (${integration.type})`;

      // Resolve board from the mapping config
      let boardId: number | undefined;
      if (change.boardRemoteOptionId && config.boardMapping[change.boardRemoteOptionId]) {
        boardId = config.boardMapping[change.boardRemoteOptionId].localId;
      } else {
        const firstBoard = Object.values(config.boardMapping)[0];
        boardId = firstBoard?.localId ?? config.defaultBoardId;
      }

      if (!boardId) {
        await this.syncLogRepo.create({
          integrationId: integration.id,
          syncRunId,
          direction: SyncDirection.INBOUND,
          status: SyncLogStatus.SKIPPED,
          message: `No board mapping found for remote page ${change.remoteId}`,
        });
        return { synced: 0, errors: 0, conflicts: 0 };
      }

      // Resolve status
      let postStatusId: null | number = null;
      if (change.statusRemoteOptionId && config.statusMapping[change.statusRemoteOptionId]) {
        postStatusId = config.statusMapping[change.statusRemoteOptionId].localId;
      }

      if (existingMapping) {
        // Check for conflict in bidirectional mode
        if (config.syncDirection === "bidirectional" && existingMapping.lastSyncAt) {
          const post = await this.postRepo.findById(existingMapping.localId);
          if (post && post.updatedAt > existingMapping.lastSyncAt) {
            await this.integrationMappingRepo.update(existingMapping.id, {
              syncStatus: IntegrationSyncStatus.CONFLICT,
              lastError: "Both local and remote were modified since last sync",
            });
            await this.syncLogRepo.create({
              integrationId: integration.id,
              syncRunId,
              mappingId: existingMapping.id,
              direction: SyncDirection.INBOUND,
              status: SyncLogStatus.CONFLICT,
              message: `Conflict detected for post ${existingMapping.localId}`,
            });
            return { synced: 0, errors: 0, conflicts: 1 };
          }
        }

        const syncedAt = new Date();
        await this.postRepo.update(existingMapping.localId, {
          title: change.title,
          description: change.description ?? null,
          postStatusId,
          tags: change.tags ?? [],
          sourceLabel,
          updatedAt: syncedAt,
          ...(change.date ? { createdAt: new Date(change.date) } : {}),
        });
        const existingMetadata = (existingMapping.metadata as Record<string, unknown>) ?? {};
        await this.integrationMappingRepo.update(existingMapping.id, {
          syncStatus: IntegrationSyncStatus.SYNCED,
          lastSyncAt: syncedAt,
          lastError: null,
          metadata: { ...existingMetadata, remoteStats: change.remoteStats ?? null } as Prisma.InputJsonValue,
        });
      } else {
        const newPost = await this.postRepo.create({
          title: change.title,
          description: change.description ?? null,
          boardId,
          postStatusId,
          tenantId: integration.tenantId,
          tags: change.tags ?? [],
          approvalStatus: POST_APPROVAL_STATUS.APPROVED,
          sourceLabel,
          ...(change.date ? { createdAt: new Date(change.date) } : {}),
        });

        existingMapping = await this.integrationMappingRepo.create({
          integrationId: integration.id,
          localType: "post",
          localId: newPost.id,
          remoteId: change.remoteId,
          remoteUrl: change.remoteUrl,
          syncStatus: IntegrationSyncStatus.SYNCED,
          lastSyncAt: new Date(),
          metadata: { direction: "inbound", remoteStats: change.remoteStats ?? null } as Prisma.InputJsonValue,
        });
      }

      await this.syncLogRepo.create({
        integrationId: integration.id,
        syncRunId,
        mappingId: existingMapping.id,
        direction: SyncDirection.INBOUND,
        status: SyncLogStatus.SUCCESS,
      });
      return { synced: 1, errors: 0, conflicts: 0 };
    } catch (error) {
      await this.syncLogRepo.create({
        integrationId: integration.id,
        syncRunId,
        direction: SyncDirection.INBOUND,
        status: SyncLogStatus.ERROR,
        message: (error as Error).message,
        details: { remoteId: change.remoteId },
      });
      return { synced: 0, errors: 1, conflicts: 0 };
    }
  }
}
