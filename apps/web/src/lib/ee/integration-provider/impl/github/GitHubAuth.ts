import "server-only";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

import { config } from "@/config";

import { type ConnectionTestResult, type IntegrationConfig, type RemoteDatabase } from "../../types";

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

interface RepoSummary {
  description: null | string;
  full_name: string;
  has_discussions?: boolean;
  html_url: string;
  owner: { avatar_url: string; login: string };
  permissions?: { push?: boolean };
}

function repoToRemoteDatabase(repo: RepoSummary): RemoteDatabase {
  return {
    id: repo.full_name,
    name: repo.full_name,
    description: repo.description ?? undefined,
    url: repo.html_url,
    propertyCount: 0,
    parentName: repo.owner.login,
    icon: repo.owner.avatar_url ? { type: "url", url: repo.owner.avatar_url } : undefined,
  };
}

export async function listAccessibleRepos(
  octokit: Octokit,
  integrationConfig: IntegrationConfig,
  filter?: (repo: RepoSummary) => boolean,
): Promise<RemoteDatabase[]> {
  const repos: RemoteDatabase[] = [];

  if (integrationConfig.authType === "app" && integrationConfig.installationId) {
    let page = 1;
    for (;;) {
      const { data } = await octokit.request("GET /installation/repositories", { per_page: 100, page });
      const items = data.repositories as unknown as RepoSummary[];
      for (const repo of items) {
        if (filter && !filter(repo)) continue;
        repos.push(repoToRemoteDatabase(repo));
      }
      if (items.length < 100) break;
      page++;
    }
    return repos;
  }

  const iterator = octokit.paginate.iterator(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: "updated",
    affiliation: "owner,collaborator,organization_member",
  });
  for await (const response of iterator) {
    for (const repo of response.data) {
      if (!repo.permissions?.push) continue;
      if (filter && !filter(repo as RepoSummary)) continue;
      repos.push(repoToRemoteDatabase(repo as RepoSummary));
    }
  }
  return repos;
}

export async function verifyGitHubConnection(
  octokit: Octokit,
  integrationConfig: IntegrationConfig,
): Promise<ConnectionTestResult> {
  try {
    if (integrationConfig.authType === "app" && integrationConfig.installationId) {
      const { data } = await octokit.request("GET /installation/repositories", { per_page: 1 });
      const botName = `${config.integrations.github.appName}[bot]`;
      const workspaceName = data.repositories[0]?.owner.login;
      return { success: true, botName, workspaceName };
    }

    const { data: user } = await octokit.rest.users.getAuthenticated();
    return { success: true, botName: user.login, workspaceName: user.name ?? undefined };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
