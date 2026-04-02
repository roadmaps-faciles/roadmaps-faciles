"use server";

import { revalidatePath } from "next/cache";

import { assertEntitlement } from "@/lib/ee/entitlements";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { webhookRepo } from "@/lib/repo";
import { type Webhook } from "@/prisma/client";
import { CreateWebhook } from "@/useCases/ee/webhooks/CreateWebhook";
import { DeleteWebhook } from "@/useCases/ee/webhooks/DeleteWebhook";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const createWebhook = async (data: { event: string; url: string }): Promise<ServerActionResponse<Webhook>> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.WEBHOOKS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new CreateWebhook(webhookRepo);
    const webhook = await useCase.execute({ tenantId: tenant.id, ...data } as Parameters<typeof useCase.execute>[0]);
    audit(
      {
        action: AuditAction.WEBHOOK_CREATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Webhook",
        targetId: String(webhook.id),
        metadata: { url: data.url, event: data.event },
      },
      reqCtx,
    );
    revalidatePath("/admin/webhooks");
    return { ok: true, data: webhook };
  } catch (error) {
    audit(
      {
        action: AuditAction.WEBHOOK_CREATE,
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

export const deleteWebhook = async (data: { id: number }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.WEBHOOKS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new DeleteWebhook(webhookRepo);
    await useCase.execute(data);
    audit(
      {
        action: AuditAction.WEBHOOK_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Webhook",
        targetId: String(data.id),
      },
      reqCtx,
    );
    revalidatePath("/admin/webhooks");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.WEBHOOK_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Webhook",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
