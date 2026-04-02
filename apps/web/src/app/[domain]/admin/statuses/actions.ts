"use server";

import { revalidatePath } from "next/cache";

import { postStatusRepo } from "@/lib/repo";
import { type PostStatus } from "@/prisma/client";
import { type PostStatusColor } from "@/prisma/enums";
import { CreatePostStatus } from "@/useCases/post_statuses/CreatePostStatus";
import { DeletePostStatus } from "@/useCases/post_statuses/DeletePostStatus";
import { ReorderPostStatuses } from "@/useCases/post_statuses/ReorderPostStatuses";
import { UpdatePostStatus } from "@/useCases/post_statuses/UpdatePostStatus";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const createPostStatus = async (data: {
  color: PostStatusColor;
  name: string;
  showInRoadmap: boolean;
}): Promise<ServerActionResponse<PostStatus>> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new CreatePostStatus(postStatusRepo);
    const status = await useCase.execute({ tenantId: tenant.id, ...data });
    audit(
      {
        action: AuditAction.POST_STATUS_CREATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "PostStatus",
        targetId: String(status.id),
        metadata: { name: data.name, color: data.color },
      },
      reqCtx,
    );
    revalidatePath("/admin/statuses");
    return { ok: true, data: status };
  } catch (error) {
    audit(
      {
        action: AuditAction.POST_STATUS_CREATE,
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

export const updatePostStatus = async (data: {
  color: PostStatusColor;
  id: number;
  name: string;
  showInRoadmap: boolean;
}): Promise<ServerActionResponse<PostStatus>> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new UpdatePostStatus(postStatusRepo);
    const status = await useCase.execute(data);
    audit(
      {
        action: AuditAction.POST_STATUS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "PostStatus",
        targetId: String(data.id),
        metadata: { name: data.name, color: data.color },
      },
      reqCtx,
    );
    revalidatePath("/admin/statuses");
    return { ok: true, data: status };
  } catch (error) {
    audit(
      {
        action: AuditAction.POST_STATUS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "PostStatus",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const deletePostStatus = async (data: { id: number }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new DeletePostStatus(postStatusRepo);
    await useCase.execute(data);
    audit(
      {
        action: AuditAction.POST_STATUS_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "PostStatus",
        targetId: String(data.id),
      },
      reqCtx,
    );
    revalidatePath("/admin/statuses");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.POST_STATUS_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "PostStatus",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const reorderPostStatuses = async (data: {
  items: Array<{ id: number; order: number }>;
}): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new ReorderPostStatuses(postStatusRepo);
    await useCase.execute(data);
    audit({ action: AuditAction.POST_STATUS_REORDER, userId: session.user.uuid, tenantId: tenant.id }, reqCtx);
    revalidatePath("/admin/statuses");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.POST_STATUS_REORDER,
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
