"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { commentCreated } from "@/lib/ee/tracking-provider/trackingPlan";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/next-auth/auth";
import { type Comment, type User } from "@/prisma/client";
import { UserRole } from "@/prisma/enums";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost } from "@/utils/tenant";

function isElevatedRole(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.OWNER || role === UserRole.MODERATOR;
}

export interface GetRepliesData {
  replies: Array<{ user: User } & Comment>;
  roleMap: Record<string, UserRole>;
}

export async function getReplies(commentId: number): Promise<ServerActionResponse<GetRepliesData>> {
  if (isNaN(commentId)) {
    return {
      ok: false,
      error: "Invalid comment ID",
    };
  }

  try {
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { tenantId: true },
    });

    if (!parentComment) {
      return { ok: false, error: "Comment not found" };
    }

    const replies = await prisma.comment.findMany({
      where: {
        parentId: commentId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Batch-fetch tenant roles for reply authors
    const userIds = [...new Set(replies.map(r => r.userId))];
    const memberships =
      userIds.length > 0
        ? await prisma.userOnTenant.findMany({
            where: { userId: { in: userIds }, tenantId: parentComment.tenantId },
            select: { userId: true, role: true },
          })
        : [];

    return {
      ok: true,
      data: {
        replies,
        roleMap: Object.fromEntries(memberships.map(m => [m.userId, m.role])),
      },
    };
  } catch (error) {
    logger.error({ err: error }, "Error fetching replies");
    return {
      ok: false,
      error: "Failed to fetch replies",
    };
  }
}

export interface SendCommentParams {
  body: string;
  parentId?: null | number;
  postId: number;
  tenantId: number;
}

export async function sendComment({
  postId,
  body,
  parentId,
  tenantId,
}: SendCommentParams): Promise<ServerActionResponse<Comment>> {
  const reqCtx = await getRequestContext();
  const t = await getTranslations("serverErrors");

  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: t("notAuthenticated") };
  }
  const userId = session.user.uuid;

  if (isNaN(postId) || !body) {
    return {
      ok: false,
      error: "Invalid input data",
    };
  }

  // Verify post belongs to tenant
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { tenantId: true },
  });

  if (!post || post.tenantId !== tenantId) {
    return { ok: false, error: "Post not found" };
  }

  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { allowComments: true },
  });

  if (!settings?.allowComments) {
    return { ok: false, error: t("commentsDisabled") };
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        body,
        postId,
        userId,
        parentId: parentId ?? null,
        tenantId,
      },
      include: {
        user: true,
      },
    });

    audit(
      {
        action: AuditAction.COMMENT_CREATE,
        userId,
        tenantId,
        targetType: "Comment",
        targetId: String(newComment.id),
        metadata: { postId, parentId },
      },
      reqCtx,
    );

    void trackServerEvent(
      userId,
      commentCreated({ postId: String(postId), tenantId: String(tenantId), isReply: !!parentId }),
    );

    return {
      ok: true,
      data: newComment,
    };
  } catch (error) {
    logger.error({ err: error }, "Error creating comment");
    audit(
      {
        action: AuditAction.COMMENT_CREATE,
        success: false,
        error: (error as Error).message,
        userId,
        tenantId,
        metadata: { postId },
      },
      reqCtx,
    );
    return {
      ok: false,
      error: "Failed to create comment",
    };
  }
}

export interface EditCommentParams {
  body: string;
  commentId: number;
}

export async function editComment({ commentId, body }: EditCommentParams): Promise<ServerActionResponse<Comment>> {
  const reqCtx = await getRequestContext();
  const t = await getTranslations("serverErrors");

  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: t("notAuthenticated") };
  }
  const userId = session.user.uuid;

  if (!body.trim()) {
    return { ok: false, error: "Comment body cannot be empty" };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, tenantId: true, postId: true },
  });

  if (!comment) {
    return { ok: false, error: "Comment not found" };
  }

  const membership = await prisma.userOnTenant.findUnique({
    where: { userId_tenantId: { userId, tenantId: comment.tenantId } },
    select: { role: true },
  });

  const isAdmin = session.user.isSuperAdmin || (membership && isElevatedRole(membership.role));
  const isAuthor = comment.userId === userId;

  if (!isAuthor && !isAdmin) {
    return { ok: false, error: t("noPermissionToEdit") };
  }

  try {
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { body: body.trim() },
      include: { user: true },
    });

    const domain = await getDomainFromHost();
    audit(
      {
        action: AuditAction.COMMENT_EDIT,
        userId,
        tenantId: comment.tenantId,
        targetType: "Comment",
        targetId: String(commentId),
        metadata: { postId: comment.postId },
      },
      reqCtx,
    );

    revalidatePath(`/${domain}/post/${comment.postId}`);
    return { ok: true, data: updated };
  } catch (error) {
    logger.error({ err: error }, "Error editing comment");
    audit(
      {
        action: AuditAction.COMMENT_EDIT,
        success: false,
        error: (error as Error).message,
        userId,
        tenantId: comment.tenantId,
      },
      reqCtx,
    );
    return { ok: false, error: "Failed to edit comment" };
  }
}

export async function deleteComment(commentId: number): Promise<ServerActionResponse> {
  const reqCtx = await getRequestContext();
  const t = await getTranslations("serverErrors");

  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: t("notAuthenticated") };
  }
  const userId = session.user.uuid;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, tenantId: true, postId: true, _count: { select: { replies: true } } },
  });

  if (!comment) {
    return { ok: false, error: "Comment not found" };
  }

  const membership = await prisma.userOnTenant.findUnique({
    where: { userId_tenantId: { userId, tenantId: comment.tenantId } },
    select: { role: true },
  });

  const isAdmin = session.user.isSuperAdmin || (membership && isElevatedRole(membership.role));
  const isAuthor = comment.userId === userId;

  if (!isAuthor && !isAdmin) {
    return { ok: false, error: t("noPermissionToDelete") };
  }

  try {
    // Delete replies first (no cascade on self-referencing relation)
    if (comment._count.replies > 0) {
      await prisma.comment.deleteMany({ where: { parentId: commentId } });
    }
    await prisma.comment.delete({ where: { id: commentId } });

    const domain = await getDomainFromHost();
    audit(
      {
        action: AuditAction.COMMENT_DELETE,
        userId,
        tenantId: comment.tenantId,
        targetType: "Comment",
        targetId: String(commentId),
        metadata: { postId: comment.postId },
      },
      reqCtx,
    );

    revalidatePath(`/${domain}/post/${comment.postId}`);
    return { ok: true };
  } catch (error) {
    logger.error({ err: error }, "Error deleting comment");
    audit(
      {
        action: AuditAction.COMMENT_DELETE,
        success: false,
        error: (error as Error).message,
        userId,
        tenantId: comment.tenantId,
      },
      reqCtx,
    );
    return { ok: false, error: "Failed to delete comment" };
  }
}
