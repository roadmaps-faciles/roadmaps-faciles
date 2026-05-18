import "server-only";

import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { decrypt } from "@/lib/ee/integration-provider/encryption";
import { type CronExecutionReport, type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { logger } from "@/lib/logger";
import { type TenantIntegration } from "@/prisma/client";

import { type ICronManager } from "../ICronManager";

export interface IRouteCronDeps {
  findDueIntegrations(): Promise<TenantIntegration[]>;
  syncIntegration(integrationId: number): Promise<void>;
  updateLastSyncAt(integrationId: number): Promise<void>;
}

export class RouteCronManager implements ICronManager {
  constructor(private readonly deps: IRouteCronDeps) {}

  public async registerJob(_integration: TenantIntegration): Promise<void> {
    // Schedule is stored in DB (syncIntervalMinutes field) - no external registration needed
  }

  public async unregisterJob(_integrationId: number): Promise<void> {
    // Schedule is stored in DB - no external deregistration needed
  }

  public async processDueJobs(): Promise<CronExecutionReport> {
    const report: CronExecutionReport = { processed: 0, skipped: 0, errors: [] };

    const dueIntegrations = await this.deps.findDueIntegrations();

    for (const integration of dueIntegrations) {
      try {
        // Validate that the integration is still connectable
        const rawConfig = integration.config as unknown as IntegrationConfig;
        const decryptedConfig = { ...rawConfig, apiKey: decrypt(rawConfig.apiKey) };
        const provider = createIntegrationProvider(integration.type, decryptedConfig);
        const connectionTest = await provider.testConnection();

        if (!connectionTest.success) {
          report.errors.push({
            integrationId: integration.id,
            error: `Connection test failed: ${connectionTest.error}`,
          });
          continue;
        }

        await this.deps.syncIntegration(integration.id);
        await this.deps.updateLastSyncAt(integration.id);
        report.processed++;
      } catch (error) {
        logger.error({ err: error, integrationId: integration.id }, "Cron sync failed");
        report.errors.push({
          integrationId: integration.id,
          error: (error as Error).message,
        });
      }
    }

    return report;
  }
}
