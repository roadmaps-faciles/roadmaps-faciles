import { randomUUID } from "node:crypto";

import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { decrypt } from "@/lib/ee/integration-provider/encryption";
import { type SyncProgress } from "@/lib/ee/integration-provider/sync-types";
import { type InboundChange, type IntegrationConfig, type PostSyncData } from "@/lib/ee/integration-provider/types";
import { logger } from "@/lib/logger";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type IIntegrationMappingRepo } from "@/lib/repo/IIntegrationMappingRepo";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IIntegrationSyncLogRepo } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { type Post, type Prisma, type TenantIntegration } from "@/prisma/client";
import { IntegrationSyncStatus, SyncDirection, SyncLogStatus } from "@/prisma/enums";

import { type UseCase } from "../../types";

export type { SyncProgress } from "@/lib/ee/integration-provider/sync-types";

export interface SyncIntegrationInput {
  integrationId: number;
  onProgress?: (progress: SyncProgress) => Promise<void> | void;
  tenantId: number;
  tenantUrl: string;
}

export interface SyncIntegrationOutput {
  conflicts: number;
  errors: number;
  synced: number;
}

export class SyncIntegration implements UseCase<SyncIntegrationInput, SyncIntegrationOutput> {
  constructor(
    private readonly integrationRepo: IIntegrationRepo,
    private readonly integrationMappingRepo: IIntegrationMappingRepo,
    private readonly syncLogRepo: IIntegrationSyncLogRepo,
    private readonly postRepo: IPostRepo,
    private readonly boardRepo: IBoardRepo,
  ) {}

  /** Best-effort progress callback — swallows errors so a disconnected client won't break sync */
  private async safeProgress(onProgress: SyncIntegrationInput["onProgress"], progress: SyncProgress): Promise<void> {
    try {
      await onProgress?.(progress);
    } catch {
      // Progress reporting is best-effort — a client disconnect should not abort sync
    }
  }

  public async execute(input: SyncIntegrationInput): Promise<SyncIntegrationOutput> {
    const integration = await this.integrationRepo.findById(input.integrationId);
    if (!integration || integration.tenantId !== input.tenantId) {
      throw new Error("Integration not found");
    }

    if (!integration.enabled) {
      throw new Error("Integration is disabled");
    }

    const rawConfig = integration.config as unknown as IntegrationConfig;
    const decryptedConfig = { ...rawConfig, apiKey: decrypt(rawConfig.apiKey) };
    const provider = createIntegrationProvider(integration.type, decryptedConfig);

    const result: SyncIntegrationOutput = { synced: 0, errors: 0, conflicts: 0 };
    const syncRunId = randomUUID();

    let currentPhase: SyncDirection = SyncDirection.OUTBOUND;

    try {
      const direction = decryptedConfig.syncDirection;

      // Phase markers so findSyncRuns can derive the correct direction even when a phase produces no item-level logs
      if (direction === "outbound" || direction === "bidirectional") {
        await this.syncLogRepo.create({
          integrationId: integration.id,
          syncRunId,
          direction: SyncDirection.OUTBOUND,
          status: SyncLogStatus.SKIPPED,
          message: "phase_marker",
        });
      }
      if (direction === "inbound" || direction === "bidirectional") {
        await this.syncLogRepo.create({
          integrationId: integration.id,
          syncRunId,
          direction: SyncDirection.INBOUND,
          status: SyncLogStatus.SKIPPED,
          message: "phase_marker",
        });
      }

      if (direction === "outbound" || direction === "bidirectional") {
        currentPhase = SyncDirection.OUTBOUND;
        const outResult = await this.syncOutbound(
          integration,
          decryptedConfig,
          provider,
          input.tenantUrl,
          input.onProgress,
          syncRunId,
        );
        result.synced += outResult.synced;
        result.errors += outResult.errors;
      }

      if (direction === "inbound" || direction === "bidirectional") {
        currentPhase = SyncDirection.INBOUND;
        const inResult = await this.syncInbound(integration, decryptedConfig, provider, input.onProgress, syncRunId);
        result.synced += inResult.synced;
        result.errors += inResult.errors;
        result.conflicts += inResult.conflicts;
      }

      // Update last sync cursor and timestamp
      // Safety margin: Notion last_edited_time has minute-level granularity,
      // so we subtract 2 minutes to avoid missing edits in the same minute window.
      // Re-processing a few items is harmless (idempotent updates).
      const cursorDate = new Date(Date.now() - 2 * 60 * 1000);
      await this.integrationRepo.update(integration.id, {
        lastSyncAt: new Date(),
        config: {
          ...rawConfig,
          lastSyncCursor: cursorDate.toISOString(),
        } as unknown as Prisma.InputJsonValue,
      });
    } catch (error) {
      // Batch-level error
      await this.syncLogRepo.create({
        integrationId: integration.id,
        syncRunId,
        direction: currentPhase,
        status: SyncLogStatus.ERROR,
        message: (error as Error).message,
      });
      result.errors++;
    }

    return result;
  }

  private async syncOutbound(
    integration: TenantIntegration,
    config: IntegrationConfig,
    provider: ReturnType<typeof createIntegrationProvider>,
    tenantUrl: string,
    onProgress: SyncIntegrationInput["onProgress"] | undefined,
    syncRunId: string,
  ): Promise<{ errors: number; synced: number }> {
    let synced = 0;
    let errors = 0;

    // Get all boards mapped for this integration (+ defaultBoardId fallback)
    const boardMappings = Object.values(config.boardMapping);
    const boardIds = boardMappings.map(m => m.localId);
    if (config.defaultBoardId && !boardIds.includes(config.defaultBoardId)) {
      boardIds.push(config.defaultBoardId);
    }

    // Pre-build boardId → slug lookup for comment links
    const boardSlugMap = new Map<number, string>();
    for (const boardId of boardIds) {
      const slug = await this.boardRepo.findSlugById(boardId);
      if (slug) boardSlugMap.set(boardId, slug);
    }

    // Signal: fetching local posts
    await this.safeProgress(onProgress, { phase: "outbound", current: 0, total: null });
    const posts = await this.postRepo.findAllForBoards(boardIds, integration.tenantId);
    const total = posts.length;
    await this.safeProgress(onProgress, { phase: "outbound", current: 0, total });

    // Process in concurrent batches (like inbound) to avoid sequential Notion API bottleneck
    const CONCURRENCY = 10;
    let batch: Post[] = [];
    let current = 0;

    const flushBatch = async () => {
      if (batch.length === 0) return;
      const results = await Promise.allSettled(
        batch.map(post =>
          this.processOneOutboundPost(post, integration, config, provider, tenantUrl, boardSlugMap, syncRunId),
        ),
      );
      for (const result of results) {
        if (result.status === "fulfilled") {
          synced += result.value.synced;
          errors += result.value.errors;
        } else {
          errors++;
        }
        current++;
        await this.safeProgress(onProgress, { phase: "outbound", current, total });
      }
      batch = [];
    };

    for (const post of posts) {
      batch.push(post);
      if (batch.length >= CONCURRENCY) {
        await flushBatch();
      }
    }
    await flushBatch();

    return { synced, errors };
  }

  private async processOneOutboundPost(
    post: Post,
    integration: TenantIntegration,
    config: IntegrationConfig,
    provider: ReturnType<typeof createIntegrationProvider>,
    tenantUrl: string,
    boardSlugMap: Map<number, string>,
    syncRunId: string,
  ): Promise<{ errors: number; synced: number }> {
    try {
      const existingMapping = await this.integrationMappingRepo.findByLocalEntity(integration.id, "post", post.id);

      const isInbound =
        existingMapping?.metadata && (existingMapping.metadata as Record<string, unknown>).direction === "inbound";

      // Inbound posts: only update comments/likes on Notion (metadata push, not counted as "synced")
      if (isInbound && existingMapping?.remoteId) {
        const { comments: commentCount, likes: likeCount } = await this.getPostCounts(post.id);
        const boardSlug = boardSlugMap.get(post.boardId) ?? String(post.boardId);
        await Promise.all([
          provider
            .updateCommentsField(
              existingMapping.remoteId,
              commentCount,
              tenantUrl,
              `/board/${boardSlug}/post/${post.id}`,
            )
            .catch(err => logger.warn({ err }, "Failed to update comments field")),
          provider
            .updateLikesField(existingMapping.remoteId, likeCount)
            .catch(err => logger.warn({ err }, "Failed to update likes field")),
        ]);
        return { synced: 0, errors: 0 };
      }

      if (isInbound) return { synced: 0, errors: 0 };

      const { comments: commentCount, likes: likeCount } = await this.getPostCounts(post.id);

      const postData: PostSyncData = {
        postId: post.id,
        title: post.title,
        description: post.description,
        boardId: post.boardId,
        postStatusId: post.postStatusId,
        tags: post.tags,
        slug: post.slug,
        createdAt: post.createdAt,
        commentCount,
        likeCount,
        tenantUrl,
      };

      const syncResult = await provider.syncOutbound(postData, existingMapping?.remoteId);

      if (syncResult.success) {
        if (existingMapping) {
          await this.integrationMappingRepo.update(existingMapping.id, {
            syncStatus: IntegrationSyncStatus.SYNCED,
            lastSyncAt: new Date(),
            lastError: null,
            remoteUrl: syncResult.remoteUrl,
          });
        } else {
          await this.integrationMappingRepo.create({
            integrationId: integration.id,
            localType: "post",
            localId: post.id,
            remoteId: syncResult.remoteId,
            remoteUrl: syncResult.remoteUrl,
            syncStatus: IntegrationSyncStatus.SYNCED,
            lastSyncAt: new Date(),
            metadata: { direction: "outbound" },
          });
        }

        // Update comments and likes fields in parallel
        if (syncResult.remoteId) {
          const boardSlug = boardSlugMap.get(post.boardId) ?? String(post.boardId);
          await Promise.all([
            provider
              .updateCommentsField(
                syncResult.remoteId,
                postData.commentCount,
                tenantUrl,
                `/board/${boardSlug}/post/${post.id}`,
              )
              .catch(err => logger.warn({ err }, "Failed to update comments field")),
            provider
              .updateLikesField(syncResult.remoteId, postData.likeCount)
              .catch(err => logger.warn({ err }, "Failed to update likes field")),
          ]);
        }

        await this.syncLogRepo.create({
          integrationId: integration.id,
          syncRunId,
          mappingId: existingMapping?.id,
          direction: SyncDirection.OUTBOUND,
          status: SyncLogStatus.SUCCESS,
        });
        return { synced: 1, errors: 0 };
      } else {
        if (existingMapping) {
          await this.integrationMappingRepo.update(existingMapping.id, {
            syncStatus: IntegrationSyncStatus.ERROR,
            lastError: syncResult.error,
          });
        }
        await this.syncLogRepo.create({
          integrationId: integration.id,
          syncRunId,
          mappingId: existingMapping?.id,
          direction: SyncDirection.OUTBOUND,
          status: SyncLogStatus.ERROR,
          message: syncResult.error,
          details: { postId: post.id },
        });
        return { synced: 0, errors: 1 };
      }
    } catch (error) {
      await this.syncLogRepo.create({
        integrationId: integration.id,
        syncRunId,
        direction: SyncDirection.OUTBOUND,
        status: SyncLogStatus.ERROR,
        message: (error as Error).message,
        details: { postId: post.id },
      });
      return { synced: 0, errors: 1 };
    }
  }

  private async syncInbound(
    integration: TenantIntegration,
    config: IntegrationConfig,
    provider: ReturnType<typeof createIntegrationProvider>,
    onProgress: SyncIntegrationInput["onProgress"] | undefined,
    syncRunId: string,
  ): Promise<{ conflicts: number; errors: number; synced: number }> {
    let synced = 0;
    let errors = 0;
    let conflicts = 0;

    const since = config.lastSyncCursor ? new Date(config.lastSyncCursor) : undefined;

    // Count upfront for determinate progress (fast: page_size=100, no content reading)
    let total: null | number = null;
    if (provider.countInbound) {
      await this.safeProgress(onProgress, { phase: "inbound", current: 0, total: null });
      total = await provider.countInbound(since);
    }
    await this.safeProgress(onProgress, { phase: "inbound", current: 0, total });

    // Stream & process in concurrent batches
    const source: AsyncIterable<InboundChange> | Iterable<InboundChange> = provider.syncInboundStream
      ? provider.syncInboundStream(since)
      : await provider.syncInbound(since);

    const CONCURRENCY = 20;
    let batch: InboundChange[] = [];
    let current = 0;

    const flushBatch = async () => {
      if (batch.length === 0) return;

      // Fetch page content in parallel (the expensive Notion API calls)
      if (provider.getPageContent) {
        await Promise.allSettled(
          batch.map(async change => {
            if (!change.description) {
              change.description = await provider.getPageContent!(change.remoteId);
            }
          }),
        );
      }

      // Process DB writes in parallel, emit progress per item
      const results = await Promise.allSettled(
        batch.map(change => this.processOneInboundChange(change, integration, config, syncRunId)),
      );
      for (const result of results) {
        if (result.status === "fulfilled") {
          synced += result.value.synced;
          errors += result.value.errors;
          conflicts += result.value.conflicts;
        } else {
          errors++;
        }
        current++;
        await this.safeProgress(onProgress, {
          phase: "inbound",
          current,
          total: total !== null ? Math.max(total, current) : total,
        });
      }
      batch = [];
    };

    for await (const change of source) {
      batch.push(change);
      if (batch.length >= CONCURRENCY) {
        await flushBatch();
      }
    }
    await flushBatch();

    return { synced, errors, conflicts };
  }

  private async processOneInboundChange(
    change: InboundChange,
    integration: TenantIntegration,
    config: IntegrationConfig,
    syncRunId: string,
  ): Promise<{ conflicts: number; errors: number; synced: number }> {
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

        // Update existing post — use a shared timestamp so updatedAt matches lastSyncAt
        // (prevents false conflict detection on next bidirectional sync)
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
        await this.integrationMappingRepo.update(existingMapping.id, {
          syncStatus: IntegrationSyncStatus.SYNCED,
          lastSyncAt: syncedAt,
          lastError: null,
        });
      } else {
        // Create new post from inbound data
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

        const newMapping = await this.integrationMappingRepo.create({
          integrationId: integration.id,
          localType: "post",
          localId: newPost.id,
          remoteId: change.remoteId,
          remoteUrl: change.remoteUrl,
          syncStatus: IntegrationSyncStatus.SYNCED,
          lastSyncAt: new Date(),
          metadata: { direction: "inbound" },
        });
        existingMapping = newMapping;
      }

      await this.syncLogRepo.create({
        integrationId: integration.id,
        syncRunId,
        mappingId: existingMapping?.id,
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

  private async getPostCounts(postId: number): Promise<{ comments: number; likes: number }> {
    const counts = await this.postRepo.getPostCounts(postId);
    return { comments: counts.comments, likes: counts.likes };
  }
}
