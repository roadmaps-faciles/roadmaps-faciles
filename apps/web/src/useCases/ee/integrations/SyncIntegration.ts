import { randomUUID } from "node:crypto";

import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { decrypt } from "@/lib/ee/integration-provider/encryption";
import { type SyncProgress } from "@/lib/ee/integration-provider/sync-types";
import { type InboundChange, type IntegrationConfig, type PostSyncData } from "@/lib/ee/integration-provider/types";
import { logger } from "@/lib/logger";
import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type IIntegrationMappingRepo } from "@/lib/repo/IIntegrationMappingRepo";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IIntegrationSyncLogRepo } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { type Post, type Prisma, type TenantIntegration } from "@/prisma/client";
import { IntegrationSyncStatus, SyncDirection, SyncLogStatus } from "@/prisma/enums";

import { type UseCase } from "../../types";
import { ApplyInboundChange } from "./ApplyInboundChange";

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

      // Inbound posts: only update comments/likes on the remote (metadata push, not counted as "synced")
      if (isInbound && existingMapping?.remoteId) {
        const { comments: commentCount, likes: likeCount } = await this.getPostCounts(post.id);
        const boardSlug = boardSlugMap.get(post.boardId) ?? String(post.boardId);
        const postPath = `/board/${boardSlug}/post/${post.id}`;
        if (provider.updateRemoteStats) {
          const meta = (existingMapping.metadata as Record<string, unknown>) ?? {};
          const cachedId = typeof meta.statsCommentId === "number" ? meta.statsCommentId : undefined;
          const result = await provider
            .updateRemoteStats(
              existingMapping.remoteId,
              { commentCount, likeCount, tenantUrl, postPath },
              cachedId ? { statsCommentId: cachedId } : undefined,
            )
            .catch(err => {
              logger.warn({ err }, "Failed to update remote stats");
              return undefined;
            });
          if (result && "statsCommentId" in result && result.statsCommentId !== cachedId) {
            await this.integrationMappingRepo.update(existingMapping.id, {
              metadata: { ...meta, statsCommentId: result.statsCommentId } as Prisma.InputJsonValue,
            });
          }
        } else {
          await Promise.all([
            provider
              .updateCommentsField(existingMapping.remoteId, commentCount, tenantUrl, postPath)
              .catch(err => logger.warn({ err }, "Failed to update comments field")),
            provider
              .updateLikesField(existingMapping.remoteId, likeCount)
              .catch(err => logger.warn({ err }, "Failed to update likes field")),
          ]);
        }
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
        let mappingId: number;
        let mappingMeta: Record<string, unknown>;
        if (existingMapping) {
          await this.integrationMappingRepo.update(existingMapping.id, {
            syncStatus: IntegrationSyncStatus.SYNCED,
            lastSyncAt: new Date(),
            lastError: null,
            remoteUrl: syncResult.remoteUrl,
          });
          mappingId = existingMapping.id;
          mappingMeta = (existingMapping.metadata as Record<string, unknown>) ?? { direction: "outbound" };
        } else {
          const created = await this.integrationMappingRepo.create({
            integrationId: integration.id,
            localType: "post",
            localId: post.id,
            remoteId: syncResult.remoteId,
            remoteUrl: syncResult.remoteUrl,
            syncStatus: IntegrationSyncStatus.SYNCED,
            lastSyncAt: new Date(),
            metadata: { direction: "outbound" },
          });
          mappingId = created.id;
          mappingMeta = { direction: "outbound" };
        }

        // Update remote stats (combined for providers that support it, otherwise separate calls)
        if (syncResult.remoteId) {
          const boardSlug = boardSlugMap.get(post.boardId) ?? String(post.boardId);
          const postPath = `/board/${boardSlug}/post/${post.id}`;
          if (provider.updateRemoteStats) {
            const cachedId = typeof mappingMeta.statsCommentId === "number" ? mappingMeta.statsCommentId : undefined;
            const result = await provider
              .updateRemoteStats(
                syncResult.remoteId,
                {
                  commentCount: postData.commentCount,
                  likeCount: postData.likeCount,
                  tenantUrl,
                  postPath,
                },
                cachedId ? { statsCommentId: cachedId } : undefined,
              )
              .catch(err => {
                logger.warn({ err }, "Failed to update remote stats");
                return undefined;
              });
            if (result && "statsCommentId" in result && result.statsCommentId !== cachedId) {
              await this.integrationMappingRepo.update(mappingId, {
                metadata: { ...mappingMeta, statsCommentId: result.statsCommentId } as Prisma.InputJsonValue,
              });
            }
          } else {
            await Promise.all([
              provider
                .updateCommentsField(syncResult.remoteId, postData.commentCount, tenantUrl, postPath)
                .catch(err => logger.warn({ err }, "Failed to update comments field")),
              provider
                .updateLikesField(syncResult.remoteId, postData.likeCount)
                .catch(err => logger.warn({ err }, "Failed to update likes field")),
            ]);
          }
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
      const applyInbound = new ApplyInboundChange(this.integrationMappingRepo, this.syncLogRepo, this.postRepo);
      const results = await Promise.allSettled(
        batch.map(change => applyInbound.execute({ change, integration, config, syncRunId })),
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

  private async getPostCounts(postId: number): Promise<{ comments: number; likes: number }> {
    const counts = await this.postRepo.getPostCounts(postId);
    return { comments: counts.comments, likes: counts.likes };
  }
}
