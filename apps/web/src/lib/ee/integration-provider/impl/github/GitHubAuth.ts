import "server-only";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

import { config } from "@/config";

import { type IntegrationConfig } from "../../types";

export function createGitHubClient(integrationConfig: IntegrationConfig): Octokit {
  if (integrationConfig.authType === "app" && integrationConfig.installationId) {
    const { appId, appPrivateKey } = config.integrations.github;
    if (!appId || !appPrivateKey) {
      throw new Error("GitHub App credentials not configured (GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY)");
    }

    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey: appPrivateKey,
        installationId: integrationConfig.installationId,
      },
    });
  }

  if (!integrationConfig.apiKey) {
    throw new Error("GitHub API key (PAT) is required");
  }

  return new Octokit({ auth: integrationConfig.apiKey });
}
