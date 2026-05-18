"use server";

import { revalidatePath } from "next/cache";

import { notifyPostMutation } from "@/lib/ee/integration-provider/notifyPostMutation";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { moderationPostApproved, moderationPostRejected } from "@/lib/ee/tracking-provider/trackingPlan";
import { logger } from "@/lib/logger";
import { postRepo } from "@/lib/repo";
import { ApprovePost, ApprovePostInput } from "@/useCases/posts/ApprovePost";
import { DeletePost, DeletePostInput } from "@/useCases/posts/DeletePost";
import { RejectPost, RejectPostInput } from "@/useCases/posts/RejectPost";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantModerator } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export async function approvePost(data: { postId: number }): Promise<ServerActionResponse> {
  const domain = await getDomainFromHost();
  const session = await assertTenantModerator(domain, false);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const validated = ApprovePostInput.safeParse({ ...data, tenantId: tenant.id });
  if (!validated.success) {
    return { ok: false, error: "Invalid data" };
  }

  try {
    const useCase = new ApprovePost(postRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.POST_APPROVE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(data.postId),
      },
      reqCtx,
    );

    void trackServerEvent(
      session.user.uuid,
      moderationPostApproved({ postId: String(data.postId), tenantId: String(tenant.id) }),
    );

    void notifyPostMutation(data.postId, `https://${domain}`);

    revalidatePath("/moderation");
    return { ok: true };
  } catch (error) {
    logger.error({ err: error }, "Error approving post");
    audit(
      {
        action: AuditAction.POST_APPROVE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
}

export async function rejectPost(data: { postId: number }): Promise<ServerActionResponse> {
  const domain = await getDomainFromHost();
  const session = await assertTenantModerator(domain, false);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const validated = RejectPostInput.safeParse({ ...data, tenantId: tenant.id });
  if (!validated.success) {
    return { ok: false, error: "Invalid data" };
  }

  try {
    const useCase = new RejectPost(postRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.POST_REJECT,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(data.postId),
      },
      reqCtx,
    );

    void trackServerEvent(
      session.user.uuid,
      moderationPostRejected({ postId: String(data.postId), tenantId: String(tenant.id) }),
    );

    revalidatePath("/moderation");
    return { ok: true };
  } catch (error) {
    logger.error({ err: error }, "Error rejecting post");
    audit(
      {
        action: AuditAction.POST_REJECT,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
}

export async function deletePost(data: { postId: number }): Promise<ServerActionResponse> {
  const domain = await getDomainFromHost();
  const session = await assertTenantModerator(domain, false);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const validated = DeletePostInput.safeParse({ ...data, tenantId: tenant.id });
  if (!validated.success) {
    return { ok: false, error: "Invalid data" };
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
        targetId: String(data.postId),
      },
      reqCtx,
    );

    revalidatePath("/moderation");
    return { ok: true };
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
}
