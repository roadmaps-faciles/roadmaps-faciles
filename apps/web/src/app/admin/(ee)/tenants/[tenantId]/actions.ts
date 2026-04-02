"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { userOnTenantRepo } from "@/lib/repo";
import { type UserRole, type UserStatus } from "@/prisma/enums";
import { RemoveMember } from "@/useCases/user_on_tenant/RemoveMember";
import { UpdateMemberRole } from "@/useCases/user_on_tenant/UpdateMemberRole";
import { UpdateMemberStatus } from "@/useCases/user_on_tenant/UpdateMemberStatus";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const updateMemberRole = async (data: {
  role: UserRole;
  tenantId: number;
  userId: string;
}): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  const t = await getTranslations("serverErrors");

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.ROOT_MEMBER_ROLE_UPDATE,
        success: false,
        error: "cannotEditOwnRole",
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditOwnRole") };
  }

  try {
    const useCase = new UpdateMemberRole(userOnTenantRepo);
    await useCase.execute({ userId: data.userId, tenantId: data.tenantId, role: data.role });
    audit(
      {
        action: AuditAction.ROOT_MEMBER_ROLE_UPDATE,
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
        metadata: { role: data.role },
      },
      reqCtx,
    );
    revalidatePath(`/admin/tenants/${data.tenantId}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_MEMBER_ROLE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const updateMemberStatus = async (data: {
  status: UserStatus;
  tenantId: number;
  userId: string;
}): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();
  const t = await getTranslations("serverErrors");

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.ROOT_MEMBER_STATUS_UPDATE,
        success: false,
        error: "cannotEditOwnStatus",
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditOwnStatus") };
  }

  try {
    const useCase = new UpdateMemberStatus(userOnTenantRepo);
    await useCase.execute({ userId: data.userId, tenantId: data.tenantId, status: data.status });
    audit(
      {
        action: AuditAction.ROOT_MEMBER_STATUS_UPDATE,
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
        metadata: { status: data.status },
      },
      reqCtx,
    );
    revalidatePath(`/admin/tenants/${data.tenantId}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_MEMBER_STATUS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const removeMember = async (data: { tenantId: number; userId: string }): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();
  const t = await getTranslations("serverErrors");

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.ROOT_MEMBER_REMOVE,
        success: false,
        error: "cannotRemoveSelf",
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotRemoveSelf") };
  }

  try {
    const useCase = new RemoveMember(userOnTenantRepo);
    await useCase.execute({ userId: data.userId, tenantId: data.tenantId });
    audit(
      {
        action: AuditAction.ROOT_MEMBER_REMOVE,
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    revalidatePath(`/admin/tenants/${data.tenantId}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_MEMBER_REMOVE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: data.tenantId,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
