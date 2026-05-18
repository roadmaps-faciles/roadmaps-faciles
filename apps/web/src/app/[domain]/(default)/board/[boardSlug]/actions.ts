"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { postCreated, postFirstCreated } from "@/lib/ee/tracking-provider/trackingPlan";
import { logger } from "@/lib/logger";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { integrationMappingRepo, postRepo } from "@/lib/repo";
import { type PublicMappingSummary } from "@/lib/repo/IIntegrationMappingRepo";
import { type Like, type Post, type PostStatus, type PostWithHotness, type Prisma, type User } from "@/prisma/client";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

import { SubmitPost, SubmitPostInput } from "../../../../../useCases/posts/SubmitPost";
import { type Order } from "./types";

const LOAD_LIMIT = 50;

export type EnrichedPost = {
  _count: Prisma.PostCountOutputType;
  likes: Like[];
  postStatus: null | PostStatus;
  remoteMappings?: PublicMappingSummary[];
  user: null | User;
} & Post;
const cleanFullTextSearch = (text: string) => {
  if (!text) return text;

  const escapeReg = /(&|\(|\))/gi;
  const cleanText = text
    .trim()
    .replace(escapeReg, " ")
    .split(" ")
    .filter(str => str)
    .join(" ")
    .replaceAll(" ", " & ");
  return cleanText.endsWith("*") ? cleanText : `${cleanText}:*`;
};

export async function fetchPostsForBoard<
  O extends Order,
  R extends O extends "trending" ? Array<{ post: Post } & PostWithHotness> : EnrichedPost[],
>(
  page: number,
  order: O,
  boardId: number,
  rawSearch?: string,
): Promise<{
  filteredCount: number;
  posts: R;
}> {
  const search = rawSearch ? cleanFullTextSearch(rawSearch) : undefined;
  const searchWhere = search
    ? {
        OR: [
          {
            title: {
              search: cleanFullTextSearch(search),
            },
          },
          {
            description: {
              search,
            },
          },
        ],
      }
    : {};
  const [count, posts] = await prisma.$transaction([
    prisma.post.count({
      where: {
        boardId,
        approvalStatus: POST_APPROVAL_STATUS.APPROVED,
        ...searchWhere,
      },
    }),
    order === "trending"
      ? prisma.postWithHotness.findMany({
          where: {
            boardId,
            ...(search
              ? {
                  post: { approvalStatus: POST_APPROVAL_STATUS.APPROVED, ...searchWhere },
                }
              : { post: { approvalStatus: POST_APPROVAL_STATUS.APPROVED } }),
          },
          orderBy: {
            hotness: "desc",
          },
          take: LOAD_LIMIT,
          skip: (page - 1) * LOAD_LIMIT,
          include: {
            post: {
              include: {
                postStatus: true,
                user: true,
                likes: true,
                _count: {
                  select: {
                    comments: true,
                    follows: true,
                    likes: true,
                  },
                },
              },
            },
          },
        })
      : prisma.post.findMany({
          where: {
            boardId,
            approvalStatus: POST_APPROVAL_STATUS.APPROVED,
            ...searchWhere,
          },
          take: LOAD_LIMIT,
          skip: (page - 1) * LOAD_LIMIT,
          orderBy: {
            ...(order === "top"
              ? {
                  likes: {
                    _count: "desc",
                  },
                }
              : { createdAt: "desc" }),
          },
          include: {
            postStatus: true,
            user: true,
            likes: true,
            _count: {
              select: {
                comments: true,
                follows: true,
                likes: true,
              },
            },
          },
        }),
  ]);

  const enrichedPosts =
    order === "trending"
      ? (posts as Array<{ post: Post } & PostWithHotness>).map(p => p.post)
      : (posts as EnrichedPost[]);

  const postIds = enrichedPosts.map(p => p.id);
  const mappingsByPostId = await integrationMappingRepo.findPublicMappingsForPosts(postIds);
  const withMappings = enrichedPosts.map(p => ({
    ...p,
    remoteMappings: mappingsByPostId.get(p.id) ?? [],
  })) as EnrichedPost[];

  return {
    posts: withMappings as R,
    filteredCount: count,
  };
}

export async function submitPost(data: {
  boardId: number;
  description?: string;
  title: string;
}): Promise<ServerActionResponse<{ pending: boolean }>> {
  const domain = await getDomainFromHost();
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const settings = await prisma.tenantSettings.findUniqueOrThrow({
    where: { tenantId: tenant.id },
  });

  const session = await auth();
  const t = await getTranslations("serverErrors");

  if (!session && !settings.allowAnonymousFeedback) {
    return { ok: false, error: t("notAuthenticated") };
  }

  let anonymousId: string | undefined;
  if (!session) {
    try {
      anonymousId = await getAnonymousId();
    } catch {
      return { ok: false, error: t("notAuthenticated") };
    }
  }

  const validated = SubmitPostInput.safeParse({
    title: data.title,
    description: data.description,
    boardId: data.boardId,
    tenantId: tenant.id,
    userId: session?.user.uuid,
    anonymousId,
    requirePostApproval: settings.requirePostApproval,
  });

  if (!validated.success) {
    return { ok: false, error: t("invalidData") };
  }

  try {
    const useCase = new SubmitPost(postRepo);
    const post = await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.POST_CREATE,
        userId: session?.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(post.id),
        metadata: { ...data, anonymousId },
      },
      reqCtx,
    );

    const distinctId = session?.user.uuid ?? `anon:${anonymousId}`;
    void trackServerEvent(
      distinctId,
      postCreated({
        postId: String(post.id),
        boardId: String(data.boardId),
        tenantId: String(tenant.id),
        isAnonymous: !session,
      }),
    );

    // Activation: detect first post for authenticated users
    if (session?.user.uuid) {
      void prisma.post.count({ where: { userId: session.user.uuid } }).then(count => {
        if (count === 1) {
          void trackServerEvent(
            session.user.uuid,
            postFirstCreated({
              postId: String(post.id),
              boardId: String(data.boardId),
              tenantId: String(tenant.id),
            }),
          );
        }
      });
    }

    revalidatePath(`/board`);
    return { ok: true, data: { pending: settings.requirePostApproval } };
  } catch (error) {
    logger.error({ err: error }, "Error submitting post");
    audit(
      {
        action: AuditAction.POST_CREATE,
        success: false,
        error: (error as Error).message,
        userId: session?.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
}
