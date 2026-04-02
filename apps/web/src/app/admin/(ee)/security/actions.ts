"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { appSettingsRepo } from "@/lib/repo";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const saveSecuritySettings = async (data: {
  force2FA: boolean;
  force2FAGraceDays: number;
}): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    await appSettingsRepo.update({
      force2FA: data.force2FA,
      force2FAGraceDays: Math.min(Math.max(data.force2FAGraceDays, 0), 5),
    });

    // When force2FA is disabled at root level, clear all pending grace period deadlines
    if (!data.force2FA) {
      await prisma.user.updateMany({
        where: { twoFactorDeadline: { not: null } },
        data: { twoFactorDeadline: null },
      });
    }

    audit(
      {
        action: AuditAction.ROOT_SECURITY_SETTINGS_UPDATE,
        userId: session.user.uuid,
        metadata: { ...data },
      },
      reqCtx,
    );

    revalidatePath("/admin/security");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_SECURITY_SETTINGS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
