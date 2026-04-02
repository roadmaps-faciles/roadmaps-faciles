"use server";

import { revalidatePath } from "next/cache";

import { appSettingsRepo } from "@/lib/repo";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";

export const pinTenant = async (tenantId: number): Promise<void> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const appSettings = await appSettingsRepo.get();
    const isPinned = appSettings.pinnedTenantId === tenantId;

    await appSettingsRepo.update({
      pinnedTenantId: isPinned ? null : tenantId,
    });

    audit(
      {
        action: AuditAction.ROOT_APP_SETTINGS_UPDATE,
        userId: session.user.uuid,
        metadata: { pinnedTenantId: isPinned ? null : tenantId },
      },
      reqCtx,
    );

    revalidatePath("/admin/tenants");
    revalidatePath("/roadmap");
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_APP_SETTINGS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    throw error;
  }
};
