"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { assertEntitlement } from "@/lib/ee/entitlements";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { apiKeyRepo } from "@/lib/repo";
import { type ApiKey } from "@/prisma/client";
import { CreateApiKey } from "@/useCases/ee/api_keys/CreateApiKey";
import { DeleteApiKey } from "@/useCases/ee/api_keys/DeleteApiKey";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const createApiKey = async (): Promise<ServerActionResponse<{ apiKey: ApiKey; token: string }>> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.API_KEYS);
  const reqCtx = await getRequestContext();

  try {
    const randomBytes = crypto.randomBytes(32);
    const token = randomBytes.toString("hex");
    const commonTokenPrefix = token.slice(0, 8);
    const randomTokenPrefix = token.slice(8, 16);
    const tokenDigest = crypto.createHash("sha256").update(token).digest("hex");

    const useCase = new CreateApiKey(apiKeyRepo);
    const apiKey = await useCase.execute({
      tenantId: tenant.id,
      userId: session.user.uuid,
      commonTokenPrefix,
      randomTokenPrefix,
      tokenDigest,
    });

    audit(
      {
        action: AuditAction.API_KEY_CREATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "ApiKey",
        targetId: String(apiKey.id),
      },
      reqCtx,
    );
    revalidatePath("/admin/api");
    return { ok: true, data: { apiKey, token } };
  } catch (error) {
    audit(
      {
        action: AuditAction.API_KEY_CREATE,
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

export const deleteApiKey = async (data: { id: number }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.API_KEYS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new DeleteApiKey(apiKeyRepo);
    await useCase.execute({ apiKeyId: data.id });
    audit(
      {
        action: AuditAction.API_KEY_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "ApiKey",
        targetId: String(data.id),
      },
      reqCtx,
    );
    revalidatePath("/admin/api");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.API_KEY_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "ApiKey",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
