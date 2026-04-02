"use server";

import { revalidatePath } from "next/cache";

import { assertEntitlement } from "@/lib/ee/entitlements";
import { type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { assertFeature } from "@/lib/feature-flags";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auth } from "@/lib/next-auth/auth";
import {
  boardRepo,
  integrationMappingRepo,
  integrationRepo,
  integrationSyncLogRepo,
  postRepo,
  postStatusRepo,
} from "@/lib/repo";
import { type TenantIntegration } from "@/prisma/client";
import { CreateBoard } from "@/useCases/boards/CreateBoard";
import { CreateIntegration } from "@/useCases/ee/integrations/CreateIntegration";
import { DeleteIntegration } from "@/useCases/ee/integrations/DeleteIntegration";
import { type GetNotionDatabasesOutput, GetNotionDatabases } from "@/useCases/ee/integrations/GetNotionDatabases";
import { GetNotionDatabaseSchema } from "@/useCases/ee/integrations/GetNotionDatabaseSchema";
import { GetSyncRuns } from "@/useCases/ee/integrations/GetSyncRuns";
import { ResolveSyncConflict } from "@/useCases/ee/integrations/ResolveSyncConflict";
import { SyncIntegration } from "@/useCases/ee/integrations/SyncIntegration";
import { TestIntegrationConnection } from "@/useCases/ee/integrations/TestIntegrationConnection";
import { UpdateIntegration } from "@/useCases/ee/integrations/UpdateIntegration";
import { CreatePostStatus } from "@/useCases/post_statuses/CreatePostStatus";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin, assertTenantModerator } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const testNotionConnection = async (data: {
  apiKey: string;
}): Promise<ServerActionResponse<{ botName?: string; success: boolean }>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  await assertTenantAdmin(domain);
  const tenantForEntitlement = await getTenantFromDomain(domain);
  await assertEntitlement(tenantForEntitlement.id, ADDON_TYPE.INTEGRATIONS);

  try {
    const useCase = new TestIntegrationConnection();
    const result = await useCase.execute({ type: "NOTION", apiKey: data.apiKey });
    return { ok: true, data: { success: result.success, botName: result.botName } };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

export const fetchNotionDatabases = async (data: {
  apiKey: string;
}): Promise<ServerActionResponse<GetNotionDatabasesOutput>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  await assertTenantAdmin(domain);
  const tenantForEntitlement = await getTenantFromDomain(domain);
  await assertEntitlement(tenantForEntitlement.id, ADDON_TYPE.INTEGRATIONS);

  try {
    const useCase = new GetNotionDatabases();
    const databases = await useCase.execute({ apiKey: data.apiKey });
    return { ok: true, data: databases };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

export const fetchNotionDatabaseSchema = async (data: {
  apiKey: string;
  databaseId: string;
}): Promise<ServerActionResponse<Awaited<ReturnType<GetNotionDatabaseSchema["execute"]>>>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  await assertTenantAdmin(domain);
  const tenantForEntitlement = await getTenantFromDomain(domain);
  await assertEntitlement(tenantForEntitlement.id, ADDON_TYPE.INTEGRATIONS);

  try {
    const useCase = new GetNotionDatabaseSchema();
    const schema = await useCase.execute(data);
    return { ok: true, data: schema };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

export const createIntegration = async (data: {
  config: IntegrationConfig;
  name: string;
  syncIntervalMinutes?: number;
  unmappedStatusOptions?: Array<{ id: string; name: string }>;
}): Promise<ServerActionResponse<TenantIntegration>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);
  const reqCtx = await getRequestContext();

  try {
    const config = { ...data.config };

    // Validate no duplicate property names in mapping
    const mappedPropertyNames: string[] = [];
    const pm = config.propertyMapping;
    if (pm.title) mappedPropertyNames.push(pm.title);
    if (pm.description && typeof pm.description === "object" && "name" in pm.description)
      mappedPropertyNames.push(pm.description.name);
    if (pm.date) mappedPropertyNames.push(pm.date.name);
    if (pm.status) mappedPropertyNames.push(pm.status.name);
    if (pm.tags) mappedPropertyNames.push(pm.tags);
    if (pm.commentsInfo) mappedPropertyNames.push(pm.commentsInfo);
    if (pm.likes) mappedPropertyNames.push(typeof pm.likes === "string" ? pm.likes : pm.likes.name);
    if (pm.board) mappedPropertyNames.push(pm.board.name);

    const duplicates = mappedPropertyNames.filter((name, i) => mappedPropertyNames.indexOf(name) !== i);
    if (duplicates.length > 0) {
      return { ok: false, error: `Duplicate property mapping: ${[...new Set(duplicates)].join(", ")}` };
    }

    // Auto-create a default board if no board mapping is configured
    if (!config.propertyMapping.board && !config.defaultBoardId) {
      const boardName = config.databaseName || "Notion";
      const existingBoards = await boardRepo.findAllForTenant(tenant.id);
      const existing = existingBoards.find(b => b.name === boardName);
      if (existing) {
        config.defaultBoardId = existing.id;
      } else {
        const createBoardUC = new CreateBoard(boardRepo);
        const board = await createBoardUC.execute({ tenantId: tenant.id, name: boardName });
        config.defaultBoardId = board.id;
      }
    }

    // Auto-create PostStatus for unmapped Notion status options
    // Uses a Map to collect new mappings, then spreads via Object.fromEntries
    // to avoid direct user-controlled property assignment (CodeQL remote-property-injection).
    if (data.unmappedStatusOptions?.length) {
      const existingStatuses = await postStatusRepo.findAllForTenant(tenant.id);
      const createStatusUC = new CreatePostStatus(postStatusRepo);
      const newMappings = new Map<string, { localId: number; notionName: string }>();
      for (const opt of data.unmappedStatusOptions) {
        const key = String(opt.id);
        const existing = existingStatuses.find(s => s.name === opt.name);
        if (existing) {
          newMappings.set(key, { localId: existing.id, notionName: opt.name });
        } else {
          const status = await createStatusUC.execute({
            tenantId: tenant.id,
            name: opt.name,
            color: "grey",
            showInRoadmap: true,
          });
          newMappings.set(key, { localId: status.id, notionName: opt.name });
          existingStatuses.push(status); // Avoid duplicate creation within the same batch
        }
      }
      Object.assign(config.statusMapping, Object.fromEntries(newMappings));
    }

    const useCase = new CreateIntegration(integrationRepo);
    const integration = await useCase.execute({
      tenantId: tenant.id,
      type: "NOTION",
      name: data.name,
      config,
      syncIntervalMinutes: data.syncIntervalMinutes,
    });
    audit(
      {
        action: AuditAction.INTEGRATION_CREATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(integration.id),
        metadata: { ...data, config: { ...data.config, apiKey: "[REDACTED]" } },
      },
      reqCtx,
    );
    revalidatePath("/admin/integrations");
    return { ok: true, data: integration };
  } catch (error) {
    audit(
      {
        action: AuditAction.INTEGRATION_CREATE,
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

export const updateIntegration = async (data: {
  enabled?: boolean;
  id: number;
  name?: string;
  syncIntervalMinutes?: null | number;
}): Promise<ServerActionResponse<TenantIntegration>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new UpdateIntegration(integrationRepo);
    const integration = await useCase.execute({ ...data, tenantId: tenant.id });
    audit(
      {
        action: AuditAction.INTEGRATION_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(data.id),
        metadata: { ...data },
      },
      reqCtx,
    );
    revalidatePath("/admin/integrations");
    return { ok: true, data: integration };
  } catch (error) {
    audit(
      {
        action: AuditAction.INTEGRATION_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const deleteIntegration = async (data: {
  cleanupInboundPosts: boolean;
  id: number;
}): Promise<ServerActionResponse<{ deletedPostCount: number }>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new DeleteIntegration(integrationRepo, integrationMappingRepo, postRepo);
    const result = await useCase.execute({ ...data, tenantId: tenant.id });
    audit(
      {
        action: AuditAction.INTEGRATION_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(data.id),
        metadata: { ...data, deletedPostCount: result.deletedPostCount },
      },
      reqCtx,
    );
    revalidatePath("/admin/integrations");
    return { ok: true, data: result };
  } catch (error) {
    audit(
      {
        action: AuditAction.INTEGRATION_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const syncIntegration = async (data: {
  integrationId: number;
}): Promise<ServerActionResponse<{ conflicts: number; errors: number; synced: number }>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new SyncIntegration(
      integrationRepo,
      integrationMappingRepo,
      integrationSyncLogRepo,
      postRepo,
      boardRepo,
    );
    const result = await useCase.execute({
      integrationId: data.integrationId,
      tenantId: tenant.id,
      tenantUrl: `https://${domain}`,
    });
    audit(
      {
        action: AuditAction.INTEGRATION_SYNC,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(data.integrationId),
        metadata: { ...result },
      },
      reqCtx,
    );
    revalidatePath(`/admin/integrations/${data.integrationId}`);
    return { ok: true, data: result };
  } catch (error) {
    audit(
      {
        action: AuditAction.INTEGRATION_SYNC,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantIntegration",
        targetId: String(data.integrationId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const resolveSyncConflict = async (data: {
  mappingId: number;
  resolution: "local" | "remote";
}): Promise<ServerActionResponse> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  const session = await assertTenantModerator(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new ResolveSyncConflict(integrationRepo, integrationMappingRepo, integrationSyncLogRepo, postRepo);
    await useCase.execute({
      mappingId: data.mappingId,
      resolution: data.resolution,
      tenantId: tenant.id,
      tenantUrl: `https://${domain}`,
    });
    audit(
      {
        action: AuditAction.INTEGRATION_SYNC,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "IntegrationMapping",
        targetId: String(data.mappingId),
        metadata: { resolution: data.resolution },
      },
      reqCtx,
    );
    revalidatePath("/admin/integrations");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

export const fetchSyncRuns = async (data: {
  integrationId: number;
  limit?: number;
}): Promise<ServerActionResponse<Awaited<ReturnType<GetSyncRuns["execute"]>>>> => {
  await assertFeature("integrations", await auth());
  const domain = await getDomainFromHost();
  await assertTenantModerator(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);

  try {
    const useCase = new GetSyncRuns(integrationRepo, integrationSyncLogRepo);
    const runs = await useCase.execute({ ...data, tenantId: tenant.id });
    return { ok: true, data: runs };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};
