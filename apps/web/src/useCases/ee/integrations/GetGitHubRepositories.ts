import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { type IntegrationConfig, type RemoteDatabase } from "@/lib/ee/integration-provider/types";

import { type UseCase } from "../../types";

export interface GetGitHubRepositoriesInput {
  apiKey?: string;
  authType?: "app" | "pat";
  installationId?: number;
}

export type GetGitHubRepositoriesOutput = RemoteDatabase[];

export class GetGitHubRepositories implements UseCase<GetGitHubRepositoriesInput, GetGitHubRepositoriesOutput> {
  public async execute(input: GetGitHubRepositoriesInput): Promise<GetGitHubRepositoriesOutput> {
    const minimalConfig: IntegrationConfig = {
      apiKey: input.apiKey ?? "",
      authType: input.authType,
      installationId: input.installationId,
      sourceType: "issues",
      databaseId: "",
      databaseName: "",
      propertyMapping: { title: "" },
      statusMapping: {},
      boardMapping: {},
      syncDirection: "bidirectional",
    };

    const provider = createIntegrationProvider("GITHUB", minimalConfig);
    return provider.listRemoteDatabases();
  }
}
