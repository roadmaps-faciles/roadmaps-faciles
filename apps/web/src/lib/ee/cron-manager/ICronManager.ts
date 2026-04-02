import "server-only";

import { type CronExecutionReport } from "@/lib/ee/integration-provider/types";
import { type TenantIntegration } from "@/prisma/client";

export interface ICronManager {
  /** Execute all due sync jobs */
  processDueJobs(): Promise<CronExecutionReport>;

  /** Register or update a sync schedule for an integration */
  registerJob(integration: TenantIntegration): Promise<void>;

  /** Remove a sync schedule */
  unregisterJob(integrationId: number): Promise<void>;
}
