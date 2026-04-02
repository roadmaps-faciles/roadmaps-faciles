"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import z from "zod";

import { prisma } from "@/lib/db/prisma";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { voteCast, voteFirstCast } from "@/lib/ee/tracking-provider/trackingPlan";
import { logger } from "@/lib/logger";
import { likeRepo } from "@/lib/repo";
import { LikePost, type LikePostInput, LikePostInputBase, type LikePostOutput } from "@/useCases/likes/LikePost";
import { UnlikePost, type UnlikePostOutput } from "@/useCases/likes/UnlikePost";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";

type LikePostResponse = ServerActionResponse<LikePostOutput | UnlikePostOutput>;

export async function likePost(input: Partial<LikePostInput>, unlike?: boolean): Promise<LikePostResponse> {
  const inputValidated = LikePostInputBase.omit({
    anonymousId: true,
  }).safeParse(input);

  if (!inputValidated.success) {
    return {
      ok: false,
      error: z.prettifyError(inputValidated.error),
    };
  }

  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId: inputValidated.data.tenantId },
    select: { allowVoting: true, allowAnonymousVoting: true },
  });

  if (!unlike) {
    const t = await getTranslations("serverErrors");

    if (!settings?.allowVoting) {
      return { ok: false, error: t("votingDisabled") };
    }

    const isAnonymous = !inputValidated.data.userId;
    if (isAnonymous && !settings.allowAnonymousVoting) {
      return { ok: false, error: t("anonymousVotingDisabled") };
    }
  }

  const reqCtx = await getRequestContext();

  try {
    let ret: LikePostOutput | UnlikePostOutput;
    const input: LikePostInput = {
      postId: inputValidated.data.postId,
      tenantId: inputValidated.data.tenantId,
      ...(inputValidated.data.userId
        ? { userId: inputValidated.data.userId }
        : {
            anonymousId: await getAnonymousId(),
          }),
    };
    if (unlike) {
      const useCase = new UnlikePost(likeRepo);
      ret = await useCase.execute(input);
    } else {
      const useCase = new LikePost(likeRepo);
      ret = await useCase.execute(input);
    }

    audit(
      {
        action: unlike ? AuditAction.POST_UNVOTE : AuditAction.POST_VOTE,
        userId: inputValidated.data.userId ?? undefined,
        tenantId: inputValidated.data.tenantId,
        targetType: "Post",
        targetId: String(inputValidated.data.postId),
      },
      reqCtx,
    );

    if (!unlike) {
      const voteDistinctId = inputValidated.data.userId ?? `anon:${input.anonymousId}`;
      void trackServerEvent(
        voteDistinctId,
        voteCast({ postId: String(input.postId), tenantId: String(input.tenantId) }),
      );

      // Activation: detect first vote for authenticated users
      if (inputValidated.data.userId) {
        const userId = inputValidated.data.userId;
        void prisma.like.count({ where: { userId } }).then(count => {
          if (count === 1) {
            void trackServerEvent(
              userId,
              voteFirstCast({ postId: String(input.postId), tenantId: String(input.tenantId) }),
            );
          }
        });
      }
    }

    revalidatePath(`/tenant/${input.tenantId}`);
    if (ret) {
      return {
        ok: true,
        data: ret,
      };
    }
    return {
      ok: true,
    };
  } catch (error) {
    logger.error({ err: error }, "Error liking post");
    audit(
      {
        action: unlike ? AuditAction.POST_UNVOTE : AuditAction.POST_VOTE,
        success: false,
        error: (error as Error).message,
        userId: inputValidated.data.userId ?? undefined,
        tenantId: inputValidated.data.tenantId,
        targetType: "Post",
        targetId: String(inputValidated.data.postId),
      },
      reqCtx,
    );
    return {
      ok: false,
      error: (error as Error).message,
    };
  }
}
