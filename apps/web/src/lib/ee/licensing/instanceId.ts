import "server-only";

import { config } from "@/config";
import { logger } from "@/lib/logger";
import { appSettingsRepo } from "@/lib/repo";

let cached: null | string = null;

/**
 * Get or auto-generate the instance ID for self-hosted licensing.
 * Priority: env var > DB > generate UUID and persist.
 * Result is cached in-process (single DB read per process lifetime).
 */
export async function getOrCreateInstanceId(): Promise<string> {
  if (cached) return cached;

  if (config.instanceId) {
    cached = config.instanceId;
    return cached;
  }

  const settings = await appSettingsRepo.get();
  if (settings.instanceId) {
    cached = settings.instanceId;
    return cached;
  }

  const newId = crypto.randomUUID();
  await appSettingsRepo.update({ instanceId: newId });
  cached = newId;
  logger.info({ instanceId: newId }, "Auto-generated and persisted INSTANCE_ID");
  return cached;
}

/**
 * Whether the instance ID was explicitly set via INSTANCE_ID env var.
 * Call after getOrCreateInstanceId() has resolved at least once.
 */
export function isInstanceIdFromEnv(): boolean {
  return !!config.instanceId;
}
