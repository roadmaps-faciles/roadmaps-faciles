import "server-only";

import { type CronExecutionReport } from "@/lib/ee/integration-provider/types";
import { type TenantIntegration } from "@/prisma/client";

import { type ICronManager } from "../ICronManager";

export class NoopCronManager implements ICronManager {
  public registerJob(_integration: TenantIntegration): Promise<void> {
    return Promise.resolve();
  }

  public unregisterJob(_integrationId: number): Promise<void> {
    return Promise.resolve();
  }

  public processDueJobs(): Promise<CronExecutionReport> {
    return Promise.resolve({ processed: 0, skipped: 0, errors: [] });
  }
}
