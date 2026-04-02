import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { encrypt } from "@/lib/ee/integration-provider/encryption";
import { type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type Prisma, type TenantIntegration } from "@/prisma/client";
import { type IntegrationType } from "@/prisma/enums";

import { type UseCase } from "../../types";

export interface CreateIntegrationInput {
  config: IntegrationConfig;
  name: string;
  syncIntervalMinutes?: number;
  tenantId: number;
  type: IntegrationType;
}

export type CreateIntegrationOutput = TenantIntegration;

export class CreateIntegration implements UseCase<CreateIntegrationInput, CreateIntegrationOutput> {
  constructor(private readonly integrationRepo: IIntegrationRepo) {}

  public async execute(input: CreateIntegrationInput): Promise<CreateIntegrationOutput> {
    // Test the connection before saving
    const provider = createIntegrationProvider(input.type, input.config);
    const connectionTest = await provider.testConnection();
    if (!connectionTest.success) {
      throw new Error(`Connection test failed: ${connectionTest.error}`);
    }

    // Encrypt the API key before storing
    const encryptedConfig: IntegrationConfig = {
      ...input.config,
      apiKey: encrypt(input.config.apiKey),
    };

    return this.integrationRepo.create({
      tenantId: input.tenantId,
      type: input.type,
      name: input.name,
      config: encryptedConfig as unknown as Prisma.InputJsonValue,
      syncIntervalMinutes: input.syncIntervalMinutes,
    });
  }
}
