import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { type IntegrationConfig, type RemoteDatabaseSchema } from "@/lib/ee/integration-provider/types";

import { type UseCase } from "../../types";

export interface GetNotionDatabaseSchemaInput {
  apiKey: string;
  databaseId: string;
}

export type GetNotionDatabaseSchemaOutput = RemoteDatabaseSchema;

export class GetNotionDatabaseSchema implements UseCase<GetNotionDatabaseSchemaInput, GetNotionDatabaseSchemaOutput> {
  public async execute(input: GetNotionDatabaseSchemaInput): Promise<GetNotionDatabaseSchemaOutput> {
    const minimalConfig: IntegrationConfig = {
      apiKey: input.apiKey,
      databaseId: input.databaseId,
      databaseName: "",
      propertyMapping: { title: "" },
      statusMapping: {},
      boardMapping: {},
      syncDirection: "bidirectional",
    };

    const provider = createIntegrationProvider("NOTION", minimalConfig);
    return provider.getRemoteDatabaseSchema(input.databaseId);
  }
}
