import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { type GitHubSourceType, type IntegrationConfig, type RemoteDatabaseSchema } from "@/lib/ee/integration-provider/types";

import { type UseCase } from "../../types";

export interface GetGitHubRepositorySchemaInput {
  apiKey?: string;
  authType?: "app" | "pat";
  installationId?: number;
  repoFullName: string;
  sourceType?: GitHubSourceType;
}

export type GetGitHubRepositorySchemaOutput = RemoteDatabaseSchema;

export class GetGitHubRepositorySchema
  implements UseCase<GetGitHubRepositorySchemaInput, GetGitHubRepositorySchemaOutput>
{
  public async execute(input: GetGitHubRepositorySchemaInput): Promise<GetGitHubRepositorySchemaOutput> {
    const minimalConfig: IntegrationConfig = {
      apiKey: input.apiKey ?? "",
      authType: input.authType,
      installationId: input.installationId,
      sourceType: input.sourceType ?? "issues",
      databaseId: input.repoFullName,
      databaseName: "",
      propertyMapping: { title: "" },
      statusMapping: {},
      boardMapping: {},
      syncDirection: "bidirectional",
    };

    const provider = createIntegrationProvider("GITHUB", minimalConfig);
    return provider.getRemoteDatabaseSchema(input.repoFullName);
  }
}
