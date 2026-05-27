"use server";

import { config } from "@/config";
import { createBridgeToken } from "@/lib/authBridge";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { tenantCreated } from "@/lib/ee/tracking-provider/trackingPlan";
import { logger } from "@/lib/logger";
import {
  invitationRepo,
  orgMemberRepo,
  organizationRepo,
  tenantRepo,
  tenantSettingsRepo,
  userOnTenantRepo,
  userRepo,
} from "@/lib/repo";
import { CreateNewTenant } from "@/useCases/tenant/CreateNewTenant";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertSession } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { CreateWelcomeEntitiesWorkflow } from "@/workflows/CreateWelcomeEntitiesWorkflow";

export const createTenantForUser = async (data: {
  name: string;
  organizationId?: number;
  organizationName?: string;
  organizationSlug?: string;
  seedDefaultData: boolean;
  subdomain: string;
}): Promise<ServerActionResponse<{ id: number; redirectUrl: string }>> => {
  const session = await assertSession();
  const reqCtx = await getRequestContext();

  try {
    // If adding to existing org, verify user is ADMIN+ on that org
    if (data.organizationId) {
      const membership = await orgMemberRepo.findByOrgAndUser(data.organizationId, session.user.uuid);
      if (!membership || (membership.role !== "ADMIN" && membership.role !== "OWNER")) {
        return { ok: false, error: "Insufficient permissions on this organization" };
      }
    }

    const useCase = new CreateNewTenant(
      tenantRepo,
      tenantSettingsRepo,
      invitationRepo,
      userOnTenantRepo,
      userRepo,
      organizationRepo,
      orgMemberRepo,
    );
    const result = await useCase.execute({
      name: data.name,
      subdomain: data.subdomain,
      creatorId: session.user.uuid,
      ownerEmails: [],
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      organizationSlug: data.organizationSlug,
    });

    audit(
      {
        action: AuditAction.ROOT_TENANT_CREATE,
        userId: session.user.uuid,
        targetType: "Tenant",
        targetId: String(result.tenant.id),
        metadata: { ...data },
      },
      reqCtx,
    );

    void trackServerEvent(
      session.user.uuid,
      tenantCreated({ tenantId: String(result.tenant.id), subdomain: data.subdomain }),
    );

    // Seed default data if requested
    if (data.seedDefaultData) {
      try {
        const workflow = new CreateWelcomeEntitiesWorkflow(result.tenant.id, step => {
          audit(
            {
              action:
                step.type === "board.create"
                  ? AuditAction.BOARD_CREATE
                  : step.type === "post-status.create"
                    ? AuditAction.POST_STATUS_CREATE
                    : AuditAction.ROADMAP_SETTINGS_UPDATE,
              userId: session.user.uuid,
              tenantId: result.tenant.id,
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
            tenantId: result.tenant.id,
            targetType: "Tenant",
            targetId: String(result.tenant.id),
          },
          reqCtx,
        );
      } catch (error) {
        logger.warn({ err: error }, "Seed default data failed during tenant creation - continuing");
      }
    }

    // Generate bridge token - client will redirect to tenant subdomain with auto-login
    const bridgeToken = createBridgeToken(session.user.uuid);
    const { headers: h } = await import("next/headers");
    const hdrs = await h();
    const reqHost = hdrs.get("x-forwarded-host") || hdrs.get("host") || new URL(config.host).host;
    const reqProtocol = hdrs.get("x-forwarded-proto") || new URL(config.host).protocol.replace(":", "");
    const tenantUrl = `${reqProtocol}://${data.subdomain}.${reqHost}/login?bridge_token=${bridgeToken}`;

    return { ok: true, data: { id: result.tenant.id, redirectUrl: tenantUrl } };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_TENANT_CREATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
