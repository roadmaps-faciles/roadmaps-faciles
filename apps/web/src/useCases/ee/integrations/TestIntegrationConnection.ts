import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { type ConnectionTestResult, type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { type IntegrationType } from "@/prisma/enums";

import { type UseCase } from "../../types";

export interface TestIntegrationConnectionInput {
  apiKey: string;
  type: IntegrationType;
}

export type TestIntegrationConnectionOutput = ConnectionTestResult;

export class TestIntegrationConnection implements UseCase<
  TestIntegrationConnectionInput,
  TestIntegrationConnectionOutput
> {
  public async execute(input: TestIntegrationConnectionInput): Promise<TestIntegrationConnectionOutput> {
    const minimalConfig: IntegrationConfig = {
      apiKey: input.apiKey,
      databaseId: "",
      databaseName: "",
      propertyMapping: { title: "" },
      statusMapping: {},
      boardMapping: {},
      syncDirection: "bidirectional",
    };

    const provider = createIntegrationProvider(input.type, minimalConfig);
    return provider.testConnection();
  }
}
