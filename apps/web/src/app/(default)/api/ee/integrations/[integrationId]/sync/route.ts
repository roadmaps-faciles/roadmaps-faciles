import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { assertEntitlement } from "@/lib/ee/entitlements";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { integrationSynced } from "@/lib/ee/tracking-provider/trackingPlan";
import { assertFeature } from "@/lib/feature-flags";
import { logger } from "@/lib/logger";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { boardRepo, integrationMappingRepo, integrationRepo, integrationSyncLogRepo, postRepo } from "@/lib/repo";
import { SyncIntegration } from "@/useCases/ee/integrations/SyncIntegration";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

// In-memory tracking of active syncs (lives for the duration of the Node.js process)
const activeSyncs = new Map<number, { startedAt: number }>();

export async function GET(_request: Request, { params }: { params: Promise<{ integrationId: string }> }) {
  try {
    const domain = await getDomainFromHost();
    await assertTenantAdmin(domain, false);
    const tenantForEntitlement = await getTenantFromDomain(domain);
    await assertEntitlement(tenantForEntitlement.id, ADDON_TYPE.INTEGRATIONS);

    const { integrationId: integrationIdParam } = await params;
    const integrationId = parseInt(integrationIdParam, 10);
    if (isNaN(integrationId)) {
      return NextResponse.json({ error: "Invalid integration ID" }, { status: StatusCodes.BAD_REQUEST });
    }

    const active = activeSyncs.get(integrationId);
    return NextResponse.json({ syncing: !!active, startedAt: active?.startedAt ?? null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ integrationId: string }> }) {
  // Auth & feature flag checks (before streaming)
  let session;
  let tenant;
  let reqCtx;
  let integrationId: number;
  let tenantUrl: string;

  try {
    const domain = await getDomainFromHost();
    session = await assertTenantAdmin(domain, false);
    await assertFeature("integrations", session);
    tenant = await getTenantFromDomain(domain);
    await assertEntitlement(tenant.id, ADDON_TYPE.INTEGRATIONS);
    reqCtx = await getRequestContext();
    tenantUrl = `https://${domain}`;

    const { integrationId: integrationIdParam } = await params;
    integrationId = parseInt(integrationIdParam, 10);
    if (isNaN(integrationId)) {
      return NextResponse.json({ error: "Invalid integration ID" }, { status: StatusCodes.BAD_REQUEST });
    }
  } catch (error) {
    logger.warn({ err: error }, "SSE sync auth failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  // Prevent concurrent syncs for the same integration
  if (activeSyncs.has(integrationId)) {
    return NextResponse.json({ error: "Sync already in progress" }, { status: StatusCodes.CONFLICT });
  }

  const encoder = new TextEncoder();
  const tenantId = tenant.id;
  const userId = session.user.uuid;

  // TransformStream ensures each write() flushes through to the client immediately
  // (unlike ReadableStream.start() which can be buffered by Next.js/Node.js)
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const flushTick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

  let writerClosed = false;

  const safeWriteSSE = async (event: string, data: unknown) => {
    if (writerClosed) return;
    try {
      await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      await flushTick();
    } catch {
      // Client disconnected - mark closed so subsequent writes are skipped
      writerClosed = true;
    }
  };

  const safeClose = async () => {
    if (writerClosed) return;
    writerClosed = true;
    try {
      await writer.close();
    } catch {
      // Already closed - ignore
    }
  };

  // Track active sync
  activeSyncs.set(integrationId, { startedAt: Date.now() });

  // Run sync in detached async - the response is returned immediately below
  void (async () => {
    try {
      const useCase = new SyncIntegration(
        integrationRepo,
        integrationMappingRepo,
        integrationSyncLogRepo,
        postRepo,
        boardRepo,
      );

      const result = await useCase.execute({
        integrationId,
        tenantId,
        tenantUrl,
        onProgress: async progress => {
          await safeWriteSSE("progress", progress);
        },
      });

      audit(
        {
          action: AuditAction.INTEGRATION_SYNC,
          userId,
          tenantId,
          targetType: "TenantIntegration",
          targetId: String(integrationId),
          metadata: { ...result },
        },
        reqCtx,
      );

      void trackServerEvent(
        userId,
        integrationSynced({
          integrationId: String(integrationId),
          synced: result.synced,
          errors: result.errors,
          conflicts: result.conflicts,
          tenantId: String(tenantId),
        }),
      );

      await safeWriteSSE("done", result);
    } catch (error) {
      audit(
        {
          action: AuditAction.INTEGRATION_SYNC,
          success: false,
          error: (error as Error).message,
          userId,
          tenantId,
          targetType: "TenantIntegration",
          targetId: String(integrationId),
        },
        reqCtx,
      );

      await safeWriteSSE("error", { message: (error as Error).message });
    } finally {
      activeSyncs.delete(integrationId);
      await safeClose();
    }
  })();

  return new Response(readable, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  });
}
