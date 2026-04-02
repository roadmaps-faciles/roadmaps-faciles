"use server";

import { appSettingsRepo } from "@/lib/repo";
import { audit, getRequestContext } from "@/lib/utils/audit";
import { assertAdmin } from "@/lib/utils/auth";
import { AuditAction } from "@/prisma/enums";
import { type ServerActionResponse } from "@/utils/next";

export async function updateRootOAuthProviders(
  providers: Record<string, boolean>,
): Promise<ServerActionResponse<void>> {
  const reqCtx = await getRequestContext();

  try {
    const session = await assertAdmin();

    await appSettingsRepo.update({
      rootOAuthProviders: { ...providers },
    });

    audit(
      {
        action: AuditAction.ROOT_APP_SETTINGS_UPDATE,
        userId: session.user.uuid,
        targetType: "AppSettings",
        targetId: "0",
        metadata: { rootOAuthProviders: { ...providers } },
      },
      reqCtx,
    );

    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_APP_SETTINGS_UPDATE,
        userId: "unknown",
        targetType: "AppSettings",
        targetId: "0",
        metadata: { error: (error as Error).message },
      },
      reqCtx,
    );

    return { ok: false, error: (error as Error).message };
  }
}
