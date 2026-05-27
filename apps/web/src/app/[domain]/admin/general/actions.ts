"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import z from "zod";

import { prisma } from "@/lib/db/prisma";
import { type DNSVerificationResult, verifyDNS } from "@/lib/ee/domain-provider/dns";
import { assertEntitlement } from "@/lib/ee/entitlements";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import {
  embedConfigured,
  tenantDomainConfigured,
  tenantSettingsUpdated,
} from "@/lib/ee/tracking-provider/trackingPlan";
import { logger } from "@/lib/logger";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { boardRepo, postStatusRepo, tenantRepo, tenantSettingsRepo, userOnTenantRepo } from "@/lib/repo";
import { DeleteTenant } from "@/useCases/tenant/DeleteTenant";
import { SaveTenantWithSettings, SaveTenantWithSettingsInput } from "@/useCases/tenant/SaveTenantWithSettings";
import { UpdateTenantDomain, UpdateTenantDomainInput } from "@/useCases/tenant/UpdateTenantDomain";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin, assertTenantOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";
import { CreateWelcomeEntitiesWorkflow } from "@/workflows/CreateWelcomeEntitiesWorkflow";

export const saveTenantSettings = async (data: unknown): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const validated = SaveTenantWithSettingsInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  try {
    const useCase = new SaveTenantWithSettings(tenantSettingsRepo);
    await useCase.execute(validated.data);
    audit(
      {
        action: AuditAction.TENANT_SETTINGS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantSettings",
        targetId: String(tenant.id),
      },
      reqCtx,
    );
    void trackServerEvent(
      session.user.uuid,
      tenantSettingsUpdated({ tenantId: String(tenant.id), setting: "general" }),
    );
    if (validated.data.allowEmbedding) {
      void trackServerEvent(session.user.uuid, embedConfigured({ tenantId: String(tenant.id) }));
    }

    revalidatePath("/admin/general");
    return { ok: true };
  } catch (error) {
    logger.error({ err: error }, "Error saving tenant settings");
    audit(
      {
        action: AuditAction.TENANT_SETTINGS_UPDATE,
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

export const deleteTenant = async (): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantOwner(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const t = await getTranslations("serverErrors");

  try {
    const useCase = new DeleteTenant(tenantRepo, userOnTenantRepo);
    await useCase.execute({ tenantId: tenant.id, userId: session.user.uuid });
    audit(
      {
        action: AuditAction.TENANT_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Tenant",
        targetId: String(tenant.id),
      },
      reqCtx,
    );
    return { ok: true };
  } catch (error) {
    const message = (error as Error).message;
    audit(
      {
        action: AuditAction.TENANT_DELETE,
        success: false,
        error: message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: message === "LAST_TENANT" ? t("lastTenant") : message };
  }
};

export const updateTenantDomain = async (data: unknown): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantOwner(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.CUSTOM_DOMAIN);
  const reqCtx = await getRequestContext();

  const validated = UpdateTenantDomainInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  try {
    const useCase = new UpdateTenantDomain(tenantSettingsRepo);
    await useCase.execute(validated.data);
    audit(
      {
        action: AuditAction.TENANT_DOMAIN_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantSettings",
        metadata: validated.data,
      },
      reqCtx,
    );
    void trackServerEvent(
      session.user.uuid,
      tenantDomainConfigured({ tenantId: String(tenant.id), domain: String(validated.data.customDomain ?? "") }),
    );

    revalidatePath("/admin/general");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.TENANT_DOMAIN_UPDATE,
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

export const seedDefaultData = async (): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  const boards = await boardRepo.findAllForTenant(tenant.id);
  const statuses = await postStatusRepo.findAllForTenant(tenant.id);
  const t = await getTranslations("serverErrors");

  if (boards.length > 0 || statuses.length > 0) {
    return { ok: false, error: t("dataAlreadyExists") };
  }

  const owner = await prisma.userOnTenant.findFirst({
    where: { tenantId: tenant.id, status: "ACTIVE", role: "OWNER" },
  });
  if (!owner) {
    return {
      ok: false,
      error: t("noActiveOwnerForSeed"),
    };
  }

  const auditActionMap = {
    "board.create": AuditAction.BOARD_CREATE,
    "post-status.create": AuditAction.POST_STATUS_CREATE,
    "roadmap-settings.update": AuditAction.ROADMAP_SETTINGS_UPDATE,
  } as const;

  try {
    const workflow = new CreateWelcomeEntitiesWorkflow(tenant.id, step => {
      audit(
        {
          action: auditActionMap[step.type],
          userId: session.user.uuid,
          tenantId: tenant.id,
          targetType: step.targetType,
          targetId: step.targetId,
          metadata: step.metadata,
        },
        reqCtx,
      );
    });
    await workflow.run();
    audit(
      {
        action: AuditAction.TENANT_SEED_DATA,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Tenant",
        targetId: String(tenant.id),
      },
      reqCtx,
    );
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.TENANT_SEED_DATA,
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

export const purgeTenantData = async (): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantOwner(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const boardIds = (await boardRepo.findAllForTenant(tenant.id)).map(b => b.id);

    await prisma.$transaction([
      // Pins (no tenantId - delete via boardId)
      prisma.pin.deleteMany({ where: { boardId: { in: boardIds } } }),
      // Entities with tenantId
      prisma.follow.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.like.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.comment.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.postStatusChange.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.post.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.postStatus.deleteMany({ where: { tenantId: tenant.id } }),
      // Reset rootBoardId before deleting boards
      prisma.tenantSettings.update({ where: { tenantId: tenant.id }, data: { rootBoardId: null } }),
      prisma.board.deleteMany({ where: { tenantId: tenant.id } }),
    ]);

    audit(
      {
        action: AuditAction.TENANT_PURGE_DATA,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Tenant",
        targetId: String(tenant.id),
      },
      reqCtx,
    );
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.TENANT_PURGE_DATA,
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

export const checkDNS = async (customDomain: string): Promise<ServerActionResponse<DNSVerificationResult>> => {
  const domain = await getDomainFromHost();
  await assertTenantOwner(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.DNS_MANAGEMENT);

  const t = await getTranslations("serverErrors");

  if (!customDomain) {
    return { ok: false, error: t("noCustomDomain") };
  }

  const result = await verifyDNS(customDomain);
  return { ok: true, data: result };
};
