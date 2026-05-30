"use server";

import { getTranslations } from "next-intl/server";
import { randomUUID } from "node:crypto";

import { config } from "@/config";
import { assertEntitlement } from "@/lib/ee/entitlements";
import { getStorageProvider } from "@/lib/ee/storage-provider";
import { ALLOWED_IMAGE_TYPES, imageExtensionForType, storagePaths } from "@/lib/ee/storage-provider/validation";
import { logger } from "@/lib/logger";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auth } from "@/lib/next-auth/auth";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export async function uploadImage(formData: FormData): Promise<ServerActionResponse<{ url: string }>> {
  const t = await getTranslations("serverErrors");
  const domain = await getDomainFromHost();
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.STORAGE_S3);
  const reqCtx = await getRequestContext();

  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: t("notAuthenticated") };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: "Invalid file",
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadInvalidFile") };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: `Invalid type: ${file.type}`,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadInvalidType") };
  }

  const maxBytes = config.storageProvider.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: `Too large: ${file.size} bytes`,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadTooLarge", { max: config.storageProvider.maxFileSizeMb }) };
  }

  const ext = imageExtensionForType(file.type);
  const key = storagePaths.image(randomUUID(), ext);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    await storage.upload(key, buffer, file.type);

    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        userId: session.user.uuid,
        tenantId: tenant.id,
        metadata: { key, contentType: file.type, size: file.size },
      },
      reqCtx,
    );

    return { ok: true, data: { url: `/api/uploads/${key}` } };
  } catch (error) {
    logger.error({ err: error }, "Error uploading image");
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadFailed") };
  }
}
