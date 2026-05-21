import { encrypt } from "@/lib/ee/integration-provider/encryption";
import { type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type TenantIntegration } from "@/prisma/client";

import { type UseCase } from "../../types";

export interface UpdateIntegrationInput {
  config?: Partial<IntegrationConfig>;
  enabled?: boolean;
  id: number;
  name?: string;
  syncIntervalMinutes?: null | number;
  tenantId: number;
}

export type UpdateIntegrationOutput = TenantIntegration;

export class UpdateIntegration implements UseCase<UpdateIntegrationInput, UpdateIntegrationOutput> {
  constructor(private readonly integrationRepo: IIntegrationRepo) {}

  public async execute(input: UpdateIntegrationInput): Promise<UpdateIntegrationOutput> {
    const existing = await this.integrationRepo.findById(input.id);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error("Integration not found");
    }

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.syncIntervalMinutes !== undefined) updateData.syncIntervalMinutes = input.syncIntervalMinutes;

    if (input.config) {
      const currentConfig = existing.config as unknown as IntegrationConfig;
      const mergedConfig = { ...currentConfig, ...input.config };

      // Re-encrypt API key if it changed (new key won't have the encrypted format)
      if (input.config.apiKey && !input.config.apiKey.includes(":")) {
        mergedConfig.apiKey = encrypt(input.config.apiKey);
      }

      updateData.config = mergedConfig;
    }

    return this.integrationRepo.update(input.id, updateData);
  }
}
