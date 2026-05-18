"use server";

import { revalidatePath } from "next/cache";

import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { type LicenseStatus } from "@/lib/ee/licensing/types";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const refreshLicenseAction = async (): Promise<ServerActionResponse<LicenseStatus>> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const status = await getLicenseStatus(true);

    audit(
      {
        action: AuditAction.ROOT_LICENSE_REFRESH,
        userId: session.user.uuid,
        metadata: { ...{ mode: status.mode, plan: status.plan, valid: status.valid } },
      },
      reqCtx,
    );

    revalidatePath("/admin/licensing");
    return { data: status, ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_LICENSE_REFRESH,
        error: (error as Error).message,
        success: false,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { error: (error as Error).message, ok: false };
  }
};
