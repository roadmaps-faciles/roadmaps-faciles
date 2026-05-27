import "server-only";

import { logger } from "@/lib/logger";
import { integrationMappingRepo, postRepo } from "@/lib/repo";

import { pushPostToGitHub } from "./impl/github/GitHubOutboundSync";
import { type PostSyncData } from "./types";

/**
 * Reactive outbound sync: notify all integrations mapped to a post that it has been mutated.
 * Fire-and-forget: callers should not await this, and errors are swallowed.
 *
 * The anti-loop guard inside each provider's outbound logic skips pushes when a sync lock
 * is active (set by the webhook handler during inbound application).
 */
export async function notifyPostMutation(postId: number, tenantUrl: string): Promise<void> {
  try {
    // Skip posts whose origin is inbound (created by a sync) - pushing back would create loops.
    // Pure outbound posts (created in RF) have no mapping yet on first save → notifications still flow.
    const mappings = await integrationMappingRepo.findMappingsForPost(postId);
    const hasInboundMapping = mappings.some(
      m =>
        m.metadata && typeof m.metadata === "object" && (m.metadata as Record<string, unknown>).direction === "inbound",
    );
    if (hasInboundMapping) return;

    const post = await postRepo.findById(postId);
    if (!post) return;

    const counts = await postRepo.getPostCounts(postId);

    const postData: PostSyncData = {
      postId: post.id,
      title: post.title,
      description: post.description,
      boardId: post.boardId,
      postStatusId: post.postStatusId,
      tags: post.tags,
      slug: post.slug,
      createdAt: post.createdAt,
      commentCount: counts.comments,
      likeCount: counts.likes,
      tenantUrl,
    };

    await pushPostToGitHub(postId, postData);
    // TODO: when other providers gain reactive outbound support, dispatch here as well
  } catch (error) {
    logger.warn({ err: error, postId }, "notifyPostMutation failed (non-fatal)");
  }
}
