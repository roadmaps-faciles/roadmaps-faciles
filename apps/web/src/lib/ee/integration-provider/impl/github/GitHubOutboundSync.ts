import "server-only";

import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { logger } from "@/lib/logger";
import { integrationMappingRepo, integrationRepo } from "@/lib/repo";

import { decrypt } from "../../encryption";
import { type IntegrationConfig, type PostSyncData } from "../../types";
import { isSyncLocked } from "./GitHubSyncGuard";

export async function pushPostToGitHub(postId: number, postData: PostSyncData): Promise<void> {
  if (await isSyncLocked(postId)) {
    logger.debug({ postId }, "GitHub outbound sync skipped - sync lock active (inbound webhook in progress)");
    return;
  }

  const mappings = await integrationMappingRepo.findMappingsForPost(postId);
  const githubMappings = mappings.filter(m => m.integration.type === "GITHUB");

  for (const mapping of githubMappings) {
    try {
      const integration = await integrationRepo.findById(mapping.integrationId);
      if (!integration?.enabled) continue;

      const encryptedConfig = integration.config as unknown as IntegrationConfig;
      const decryptedConfig: IntegrationConfig = {
        ...encryptedConfig,
        apiKey: encryptedConfig.apiKey ? decrypt(encryptedConfig.apiKey) : "",
      };

      const provider = createIntegrationProvider("GITHUB", decryptedConfig);
      const result = await provider.syncOutbound(postData, mapping.remoteId);

      if (result.success) {
        await integrationMappingRepo.update(mapping.id, {
          syncStatus: "SYNCED",
          lastSyncAt: new Date(),
          lastError: null,
        });
      } else {
        await integrationMappingRepo.update(mapping.id, {
          syncStatus: "ERROR",
          lastError: result.error ?? "Unknown error",
        });
      }
    } catch (error) {
      logger.error({ postId, mappingId: mapping.id, error }, "GitHub outbound sync failed");
      await integrationMappingRepo.update(mapping.id, {
        syncStatus: "ERROR",
        lastError: (error as Error).message,
      });
    }
  }
}
