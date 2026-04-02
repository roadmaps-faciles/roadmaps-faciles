import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { type IntegrationConfig, type RemoteDatabase } from "@/lib/ee/integration-provider/types";

import { type UseCase } from "../../types";

export interface GetNotionDatabasesInput {
  apiKey: string;
}

export type GetNotionDatabasesOutput = RemoteDatabase[];

export class GetNotionDatabases implements UseCase<GetNotionDatabasesInput, GetNotionDatabasesOutput> {
  public async execute(input: GetNotionDatabasesInput): Promise<GetNotionDatabasesOutput> {
    const minimalConfig: IntegrationConfig = {
      apiKey: input.apiKey,
      databaseId: "",
      databaseName: "",
      propertyMapping: { title: "" },
      statusMapping: {},
      boardMapping: {},
      syncDirection: "bidirectional",
    };

    const provider = createIntegrationProvider("NOTION", minimalConfig);
    return provider.listRemoteDatabases();
  }
}
