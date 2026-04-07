import "server-only";
import { type Octokit } from "octokit";

import {
  type ConnectionTestResult,
  type InboundChange,
  type IntegrationConfig,
  type PostSyncData,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type RemoteProperty,
  type SyncResult,
} from "../../types";
import {
  MANAGED_LABEL,
  buildBoardLabel,
  buildStatusLabel,
  isRoadmapsFacilesLabel,
  parseBoardLabel,
  parseStatusLabel,
} from "./GitHubLabels";
import { type IGitHubSource } from "./IGitHubSource";
import { parseRepoFullName } from "./types";

export class GitHubIssueSource implements IGitHubSource {
  constructor(
    private readonly octokit: Octokit,
    private readonly config: IntegrationConfig,
  ) {}

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      return { success: true, botName: user.login, workspaceName: user.name ?? undefined };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async listRemoteDatabases(): Promise<RemoteDatabase[]> {
    const repos: RemoteDatabase[] = [];
    const iterator = this.octokit.paginate.iterator(this.octokit.rest.repos.listForAuthenticatedUser, {
      per_page: 100,
      sort: "updated",
      affiliation: "owner,collaborator,organization_member",
    });

    for await (const response of iterator) {
      for (const repo of response.data) {
        if (!repo.permissions?.push) continue;
        repos.push({
          id: repo.full_name,
          name: repo.full_name,
          description: repo.description ?? undefined,
          url: repo.html_url,
          propertyCount: 0,
          parentName: repo.owner.login,
          icon: repo.owner.avatar_url ? { type: "url", url: repo.owner.avatar_url } : undefined,
        });
      }
    }

    return repos;
  }

  async getRemoteDatabaseSchema(repoFullName: string): Promise<RemoteDatabaseSchema> {
    const { owner, repo } = parseRepoFullName(repoFullName);
    const properties: RemoteProperty[] = [];

    properties.push({ id: "title", name: "Title", type: "title" });
    properties.push({ id: "body", name: "Body", type: "rich_text" });

    const { data: labels } = await this.octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100,
    });

    const labelOptions = labels
      .filter(l => !isRoadmapsFacilesLabel(l.name))
      .map(l => ({ id: l.name, name: l.name, color: l.color ?? undefined }));

    properties.push({
      id: "labels",
      name: "Labels",
      type: "multi_select",
      options: labelOptions,
    });

    properties.push({
      id: "state",
      name: "State",
      type: "select",
      options: [
        { id: "open", name: "open" },
        { id: "closed", name: "closed" },
      ],
    });

    try {
      const { data: milestones } = await this.octokit.rest.issues.listMilestones({
        owner,
        repo,
        state: "all",
        per_page: 100,
      });

      if (milestones.length > 0) {
        properties.push({
          id: "milestone",
          name: "Milestone",
          type: "select",
          options: milestones.map(m => ({ id: String(m.number), name: m.title })),
        });
      }
    } catch {
      // Milestones may not be accessible — skip
    }

    return { id: repoFullName, name: repoFullName, properties };
  }

  async syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult> {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    const labels = [MANAGED_LABEL];

    if (post.postStatusId) {
      const statusEntry = Object.values(this.config.statusMapping).find(m => m.localId === post.postStatusId);
      if (statusEntry) {
        labels.push(buildStatusLabel(statusEntry.remoteName));
      }
    }

    const boardEntry = Object.values(this.config.boardMapping).find(m => m.localId === post.boardId);
    if (boardEntry) {
      labels.push(buildBoardLabel(boardEntry.remoteName));
    }

    if (post.tags.length > 0) {
      labels.push(...post.tags);
    }

    try {
      if (existingRemoteId) {
        const issueNumber = parseInt(existingRemoteId, 10);
        const { data: issue } = await this.octokit.rest.issues.update({
          owner,
          repo,
          issue_number: issueNumber,
          title: post.title,
          body: post.description ?? undefined,
          labels,
        });
        return { success: true, remoteId: String(issue.number), remoteUrl: issue.html_url };
      }

      const { data: issue } = await this.octokit.rest.issues.create({
        owner,
        repo,
        title: post.title,
        body: post.description ?? undefined,
        labels,
      });
      return { success: true, remoteId: String(issue.number), remoteUrl: issue.html_url };
    } catch (error) {
      return { success: false, remoteId: existingRemoteId ?? "", error: (error as Error).message };
    }
  }

  async *syncInboundStream(since?: Date): AsyncGenerator<InboundChange> {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    const includePRs = this.config.includePullRequests ?? false;

    const iterator = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      since: since?.toISOString(),
      per_page: 100,
    });

    for await (const response of iterator) {
      for (const issue of response.data) {
        if ("pull_request" in issue && issue.pull_request && !includePRs) continue;
        yield this.issueToInboundChange(issue);
      }
    }
  }

  async countInbound(since?: Date): Promise<number> {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    const includePRs = this.config.includePullRequests ?? false;
    let count = 0;

    const iterator = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      since: since?.toISOString(),
      per_page: 100,
    });

    for await (const response of iterator) {
      for (const issue of response.data) {
        if ("pull_request" in issue && issue.pull_request && !includePRs) continue;
        count++;
      }
    }

    return count;
  }

  async getInboundChange(remoteId: string): Promise<InboundChange | null> {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    try {
      const { data: issue } = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: parseInt(remoteId, 10),
      });
      return this.issueToInboundChange(issue);
    } catch {
      return null;
    }
  }

  getPageContent(remoteId: string): Promise<string | undefined> {
    return this.getInboundChange(remoteId).then(change => change?.description);
  }

  buildRemoteUrl(remoteId: string): string {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    return `https://github.com/${owner}/${repo}/issues/${remoteId}`;
  }

  private issueToInboundChange(issue: {
    body?: null | string;
    created_at: string;
    html_url: string;
    labels: Array<{ name?: string } | string>;
    milestone?: { number: number; title: string } | null;
    number: number;
    title: string;
    updated_at: string;
  }): InboundChange {
    const labels = issue.labels.map(l => (typeof l === "string" ? l : (l.name ?? ""))).filter(Boolean);

    let statusRemoteOptionId: string | undefined;
    let boardRemoteOptionId: string | undefined;
    const tags: string[] = [];

    for (const label of labels) {
      const statusName = parseStatusLabel(label);
      if (statusName) {
        const entry = Object.entries(this.config.statusMapping).find(([, v]) => v.remoteName === statusName);
        if (entry) statusRemoteOptionId = entry[0];
        continue;
      }

      const boardName = parseBoardLabel(label);
      if (boardName) {
        const entry = Object.entries(this.config.boardMapping).find(([, v]) => v.remoteName === boardName);
        if (entry) boardRemoteOptionId = entry[0];
        continue;
      }

      if (!isRoadmapsFacilesLabel(label)) {
        tags.push(label);
      }
    }

    if (!boardRemoteOptionId && issue.milestone) {
      const entry = Object.entries(this.config.boardMapping).find(([, v]) => v.remoteName === issue.milestone!.title);
      if (entry) boardRemoteOptionId = entry[0];
    }

    return {
      remoteId: String(issue.number),
      remoteUrl: issue.html_url,
      title: issue.title,
      description: issue.body ?? undefined,
      lastEditedTime: issue.updated_at,
      date: issue.created_at,
      tags,
      statusRemoteOptionId,
      boardRemoteOptionId,
    };
  }
}
