"use server";

import { revalidatePath } from "next/cache";

import { boardRepo, postRepo, tenantSettingsRepo } from "@/lib/repo";
import { UpdatePostRoadmapMeta, UpdatePostRoadmapMetaInput } from "@/useCases/posts/UpdatePostRoadmapMeta";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const saveRoadmapSettings = async (data: { rootBoardId: null | number }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const settings = await tenantSettingsRepo.findByTenantId(tenant.id);
    if (!settings) throw new Error("Settings not found");

    if (data.rootBoardId !== null) {
      const board = await boardRepo.findById(data.rootBoardId);
      if (!board || board.tenantId !== tenant.id) throw new Error("Board not found");
    }

    await tenantSettingsRepo.update(settings.id, data);
    audit(
      {
        action: AuditAction.ROADMAP_SETTINGS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantSettings",
        targetId: String(settings.id),
        metadata: { rootBoardId: data.rootBoardId },
      },
      reqCtx,
    );
    revalidatePath("/admin/roadmap");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROADMAP_SETTINGS_UPDATE,
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

export const updatePostRoadmapMeta = async (data: {
  postId: number;
  progress: null | number;
  eta: null | string;
}): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const parsed = UpdatePostRoadmapMetaInput.safeParse({
    postId: data.postId,
    tenantId: tenant.id,
    progress: data.progress,
    eta: data.eta,
  });

  if (!parsed.success) {
    audit(
      {
        action: AuditAction.POST_ROADMAP_META_UPDATE,
        success: false,
        error: parsed.error.message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(data.postId),
      },
      reqCtx,
    );
    return { ok: false, error: parsed.error.message };
  }

  try {
    const useCase = new UpdatePostRoadmapMeta(postRepo);
    const updated = await useCase.execute(parsed.data);

    audit(
      {
        action: AuditAction.POST_ROADMAP_META_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(updated.id),
        metadata: { progress: updated.progress, eta: updated.eta },
      },
      reqCtx,
    );
    revalidatePath("/admin/roadmap");
    revalidatePath("/roadmap");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.POST_ROADMAP_META_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Post",
        targetId: String(data.postId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
