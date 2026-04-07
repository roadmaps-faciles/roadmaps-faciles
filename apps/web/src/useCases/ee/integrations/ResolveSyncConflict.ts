import { randomUUID } from "node:crypto";

import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { decrypt } from "@/lib/ee/integration-provider/encryption";
import { type IntegrationConfig, type PostSyncData } from "@/lib/ee/integration-provider/types";
import { type IIntegrationMappingRepo } from "@/lib/repo/IIntegrationMappingRepo";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IIntegrationSyncLogRepo } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { IntegrationSyncStatus, SyncDirection, SyncLogStatus } from "@/prisma/enums";

import { type UseCase } from "../../types";

export interface ResolveSyncConflictInput {
  mappingId: number;
  /** "local" keeps the RF version and pushes to Notion, "remote" pulls Notion version to RF */
  resolution: "local" | "remote";
  tenantId: number;
  tenantUrl: string;
}

export type ResolveSyncConflictOutput = void;

export class ResolveSyncConflict implements UseCase<ResolveSyncConflictInput, ResolveSyncConflictOutput> {
  constructor(
    private readonly integrationRepo: IIntegrationRepo,
    private readonly integrationMappingRepo: IIntegrationMappingRepo,
    private readonly syncLogRepo: IIntegrationSyncLogRepo,
    private readonly postRepo: IPostRepo,
  ) {}

  public async execute(input: ResolveSyncConflictInput): Promise<void> {
    const mapping = await this.integrationMappingRepo.findById(input.mappingId);
    if (!mapping) {
      throw new Error("Mapping not found");
    }

    const integration = await this.integrationRepo.findById(mapping.integrationId);
    if (!integration || integration.tenantId !== input.tenantId) {
      throw new Error("Integration not found");
    }

    const rawConfig = integration.config as unknown as IntegrationConfig;
    const decryptedConfig = { ...rawConfig, apiKey: decrypt(rawConfig.apiKey) };
    const provider = createIntegrationProvider(integration.type, decryptedConfig);

    if (input.resolution === "local") {
      // Push local version to Notion
      const post = await this.postRepo.findById(mapping.localId);
      if (!post) throw new Error("Local post not found");
      if (post.tenantId !== input.tenantId) throw new Error("Post does not belong to caller's tenant");

      const postData: PostSyncData = {
        postId: post.id,
        title: post.title,
        description: post.description,
        boardId: post.boardId,
        postStatusId: post.postStatusId,
        tags: post.tags,
        slug: post.slug,
        createdAt: post.createdAt,
        commentCount: 0,
        likeCount: 0,
        tenantUrl: input.tenantUrl,
      };

      const result = await provider.syncOutbound(postData, mapping.remoteId);
      if (!result.success) {
        throw new Error(`Failed to push local version: ${result.error}`);
      }
    } else {
      // Pull single page from Notion (avoids full DB scan)
      if (!provider.getInboundChange) {
        throw new Error("Provider does not support single-page fetch; cannot resolve conflict with remote resolution");
      }
      const change = await provider.getInboundChange(mapping.remoteId);

      if (!change) {
        throw new Error("Remote page not found in Notion");
      }

      let postStatusId: null | number = null;
      if (change.statusRemoteOptionId && decryptedConfig.statusMapping[change.statusRemoteOptionId]) {
        postStatusId = decryptedConfig.statusMapping[change.statusRemoteOptionId].localId;
      }

      await this.postRepo.update(mapping.localId, {
        title: change.title,
        description: change.description ?? null,
        postStatusId,
        tags: change.tags ?? [],
      });
    }

    // Mark conflict as resolved
    await this.integrationMappingRepo.update(mapping.id, {
      syncStatus: IntegrationSyncStatus.SYNCED,
      lastSyncAt: new Date(),
      lastError: null,
    });

    await this.syncLogRepo.create({
      integrationId: integration.id,
      syncRunId: randomUUID(),
      mappingId: mapping.id,
      direction: input.resolution === "local" ? SyncDirection.OUTBOUND : SyncDirection.INBOUND,
      status: SyncLogStatus.SUCCESS,
      message: `Conflict resolved: kept ${input.resolution} version`,
    });
  }
}
