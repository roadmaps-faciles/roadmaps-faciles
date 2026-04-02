"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { userRepo } from "@/lib/repo";
import { UserRole, UserStatus } from "@/prisma/enums";
import { UpdateUser } from "@/useCases/users/UpdateUser";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

interface UpdateUserData {
  email?: string;
  name?: null | string;
  role?: UserRole;
  status?: UserStatus;
  username?: null | string;
}

export const updateUser = async (data: { data: UpdateUserData; userId: string }): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.ROOT_USER_UPDATE,
        success: false,
        error: "cannotEditSelf",
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditSelf") };
  }

  if (data.data.role && (data.data.role === UserRole.OWNER || data.data.role === UserRole.INHERITED)) {
    audit(
      {
        action: AuditAction.ROOT_USER_UPDATE,
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

  if (data.data.status && data.data.status === UserStatus.DELETED) {
    audit(
      {
        action: AuditAction.ROOT_USER_UPDATE,
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
    await useCase.execute({ id: data.userId, data: data.data });
    audit(
      {
        action: AuditAction.ROOT_USER_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: data.userId,
        metadata: { ...data.data },
      },
      reqCtx,
    );
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${data.userId}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_USER_UPDATE,
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
