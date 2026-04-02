import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { config } from "@/config";
import { hasEntitlement } from "@/lib/ee/entitlements";
import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { decrypt } from "@/lib/ee/integration-provider/encryption";
import { type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { getFeatureFlags } from "@/lib/feature-flags";
import { logger } from "@/lib/logger";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { boardRepo, integrationMappingRepo, integrationRepo, integrationSyncLogRepo, postRepo } from "@/lib/repo";
import { SyncIntegration } from "@/useCases/ee/integrations/SyncIntegration";

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const expectedSecret = config.integrations.cronSecret;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  // Check feature flag (no session for cron — check global flag only)
  const flags = await getFeatureFlags();
  if (!flags.integrations) {
    return NextResponse.json({ error: "Feature disabled" }, { status: StatusCodes.FORBIDDEN });
  }

  const dueIntegrations = await integrationRepo.findDueForSync();

  const report = { processed: 0, skipped: 0, errors: [] as Array<{ error: string; integrationId: number }> };

  for (const integration of dueIntegrations) {
    try {
      // Check entitlements for this tenant (needs both INTEGRATIONS and CRON_JOBS)
      const hasIntegrations = await hasEntitlement(integration.tenantId, ADDON_TYPE.INTEGRATIONS);
      const hasCronJobs = await hasEntitlement(integration.tenantId, ADDON_TYPE.CRON_JOBS);
      if (!hasIntegrations || !hasCronJobs) {
        report.skipped++;
        continue;
      }

      // Quick connection check
      const rawConfig = integration.config as unknown as IntegrationConfig;
      const decryptedConfig = { ...rawConfig, apiKey: decrypt(rawConfig.apiKey) };
      const provider = createIntegrationProvider(integration.type, decryptedConfig);
      const connectionTest = await provider.testConnection();

      if (!connectionTest.success) {
        report.errors.push({ integrationId: integration.id, error: `Connection test failed: ${connectionTest.error}` });
        continue;
      }

      // Run sync
      const useCase = new SyncIntegration(
        integrationRepo,
        integrationMappingRepo,
        integrationSyncLogRepo,
        postRepo,
        boardRepo,
      );

      await useCase.execute({
        integrationId: integration.id,
        tenantId: integration.tenantId,
        tenantUrl: `https://${config.rootDomain}`,
      });

      report.processed++;
    } catch (error) {
      logger.error({ err: error, integrationId: integration.id }, "Cron sync failed");
      report.errors.push({ integrationId: integration.id, error: (error as Error).message });
    }
  }

  logger.info({ report }, "Cron integrations sync completed");

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
