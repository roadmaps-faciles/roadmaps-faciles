"use server";

import { revalidatePath } from "next/cache";

import { FEATURE_FLAGS, type FeatureFlagsMap } from "@/lib/feature-flags";
import { appSettingsRepo } from "@/lib/repo";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const saveFeatureFlags = async (flags: FeatureFlagsMap): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  // Sanitize: only keep keys present in the registry, coerce to boolean
  const safeFlags = Object.fromEntries(
    Object.keys(FEATURE_FLAGS)
      .filter(k => k in flags)
      .map(k => [k, Boolean((flags as Record<string, unknown>)[k])]),
  );

  try {
    await appSettingsRepo.update({ featureFlags: safeFlags });

    audit(
      {
        action: AuditAction.ROOT_FEATURE_FLAGS_UPDATE,
        userId: session.user.uuid,
        metadata: { ...safeFlags },
      },
      reqCtx,
    );

    revalidatePath("/admin/feature-flags");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_FEATURE_FLAGS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
