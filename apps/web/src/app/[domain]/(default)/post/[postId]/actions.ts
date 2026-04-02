"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import z from "zod";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/next-auth/auth";
import { integrationMappingRepo, postRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import { DeletePost, DeletePostInput } from "@/useCases/posts/DeletePost";
import { UpdatePostContent, UpdatePostContentInput } from "@/useCases/posts/UpdatePostContent";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const updatePost = async (data: unknown): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: t("notAuthenticated") };
  }

  const domain = await getDomainFromHost();
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const validated = UpdatePostContentInput.safeParse({
    ...(data as Record<string, unknown>),
    editedById: session.user.uuid,
    tenantId: tenant.id,
  });
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const [post, settings, membership] = await Promise.all([
    prisma.post.findUnique({ where: { id: validated.data.postId }, select: { userId: true, tenantId: true } }),
    prisma.tenantSettings.findUnique({ where: { tenantId: tenant.id }, select: { allowPostEdits: true } }),
    prisma.userOnTenant.findUnique({
      where: { userId_tenantId: { userId: session.user.uuid, tenantId: tenant.id } },
      select: { role: true },
    }),
  ]);

  if (!post || post.tenantId !== tenant.id) {
    return { ok: false, error: t("postNotFound") };
  }

  // Block editing inbound-only posts (readonly from Notion); bidirectional inbound posts are editable
  const mappings = await integrationMappingRepo.findMappingsForPost(validated.data.postId);
  const inboundMapping = mappings.find(
    m => m.metadata && (m.metadata as Record<string, unknown>).direction === "inbound",
  );
  const isInboundOnly =
    inboundMapping && (inboundMapping.integration.config as Record<string, unknown>)?.syncDirection === "inbound";
  if (isInboundOnly) {
    audit(
      {
        action: AuditAction.POST_EDIT,
        success: false,
        error: "inbound readonly",
        tenantId: tenant.id,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: t("inboundPostReadonly") };
  }

  const isAdmin =
    session.user.isSuperAdmin ||
    (membership &&
      (membership.role === UserRole.ADMIN ||
        membership.role === UserRole.OWNER ||
        membership.role === UserRole.MODERATOR));
  const isAuthor = post.userId === session.user.uuid;

  if (!isAdmin && !(isAuthor && settings?.allowPostEdits)) {
    return { ok: false, error: t("noPermissionToEdit") };
  }

  try {
    const useCase = new UpdatePostContent(postRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.POST_EDIT,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(validated.data.postId),
      },
      reqCtx,
    );

    revalidatePath(`/${domain}/post/${validated.data.postId}`);
    return { ok: true };
  } catch (error) {
    logger.error({ err: error }, "Error updating post");
    audit(
      {
        action: AuditAction.POST_EDIT,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const deletePost = async (data: unknown): Promise<ServerActionResponse<{ boardSlug: string }>> => {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: t("notAuthenticated") };
  }

  const domain = await getDomainFromHost();
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const validated = DeletePostInput.safeParse({
    ...(data as Record<string, unknown>),
    tenantId: tenant.id,
  });
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const [post, settings, membership] = await Promise.all([
    prisma.post.findUnique({
      where: { id: validated.data.postId },
      select: { userId: true, tenantId: true, board: { select: { slug: true } } },
    }),
    prisma.tenantSettings.findUnique({ where: { tenantId: tenant.id }, select: { allowPostDeletion: true } }),
    prisma.userOnTenant.findUnique({
      where: { userId_tenantId: { userId: session.user.uuid, tenantId: tenant.id } },
      select: { role: true },
    }),
  ]);

  if (!post || post.tenantId !== tenant.id) {
    return { ok: false, error: t("postNotFound") };
  }

  // Block deleting inbound-only posts (managed by Notion integration); bidirectional inbound posts are deletable
  const deleteMappings = await integrationMappingRepo.findMappingsForPost(validated.data.postId);
  const inboundDeleteMapping = deleteMappings.find(
    m => m.metadata && (m.metadata as Record<string, unknown>).direction === "inbound",
  );
  const isInboundOnlyDelete =
    inboundDeleteMapping &&
    (inboundDeleteMapping.integration.config as Record<string, unknown>)?.syncDirection === "inbound";
  if (isInboundOnlyDelete) {
    audit(
      {
        action: AuditAction.POST_DELETE,
        success: false,
        error: "inbound readonly",
        tenantId: tenant.id,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: t("inboundPostReadonly") };
  }

  const isAdmin =
    session.user.isSuperAdmin ||
    (membership &&
      (membership.role === UserRole.ADMIN ||
        membership.role === UserRole.OWNER ||
        membership.role === UserRole.MODERATOR));
  const isAuthor = post.userId === session.user.uuid;

  if (!isAdmin && !(isAuthor && settings?.allowPostDeletion)) {
    return { ok: false, error: t("noPermissionToDelete") };
  }

  try {
    const useCase = new DeletePost(postRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.POST_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(validated.data.postId),
      },
      reqCtx,
    );

    const boardSlug = post.board?.slug;
    if (boardSlug) {
      revalidatePath(`/${domain}/board/${boardSlug}`);
    } else {
      revalidatePath(`/${domain}`);
    }
    return { ok: true, data: { boardSlug: boardSlug ?? "" } };
  } catch (error) {
    logger.error({ err: error }, "Error deleting post");
    audit(
      {
        action: AuditAction.POST_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
