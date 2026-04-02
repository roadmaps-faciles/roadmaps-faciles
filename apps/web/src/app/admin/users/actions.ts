"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { userRepo } from "@/lib/repo";
import { UserRole, UserStatus } from "@/prisma/enums";
import { UpdateUser } from "@/useCases/users/UpdateUser";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const updateUserRole = async (data: { role: UserRole; userId: string }): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.ROOT_USER_ROLE_UPDATE,
        success: false,
        error: "cannotEditOwnRole",
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditOwnRole") };
  }

  if (data.role === UserRole.OWNER || data.role === UserRole.INHERITED) {
    audit(
      {
        action: AuditAction.ROOT_USER_ROLE_UPDATE,
        success: false,
        error: "targetRoleForbidden",
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("targetRoleForbidden") };
  }

  try {
    const useCase = new UpdateUser(userRepo);
    await useCase.execute({ id: data.userId, data: { role: data.role } });
    audit(
      {
        action: AuditAction.ROOT_USER_ROLE_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
        metadata: { role: data.role },
      },
      reqCtx,
    );
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_USER_ROLE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const updateUserStatus = async (data: { status: UserStatus; userId: string }): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.ROOT_USER_STATUS_UPDATE,
        success: false,
        error: "cannotEditOwnStatus",
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditOwnStatus") };
  }

  if (data.status === UserStatus.DELETED) {
    audit(
      {
        action: AuditAction.ROOT_USER_STATUS_UPDATE,
        success: false,
        error: "targetStatusForbidden",
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("targetStatusForbidden") };
  }

  try {
    const useCase = new UpdateUser(userRepo);
    await useCase.execute({ id: data.userId, data: { status: data.status } });
    audit(
      {
        action: AuditAction.ROOT_USER_STATUS_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
        metadata: { status: data.status },
      },
      reqCtx,
    );
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_USER_STATUS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
