import "server-only";
import { type Octokit } from "octokit";

import {
  type ConnectionTestResult,
  type InboundChange,
  type IntegrationConfig,
  type PostSyncData,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type SyncResult,
} from "../../types";
import { listAccessibleRepos, verifyGitHubConnection } from "./GitHubAuth";
import { isRoadmapsFacilesLabel, parseStatusLabel } from "./GitHubLabels";
import { type IGitHubSource } from "./IGitHubSource";
import { parseRepoFullName } from "./types";

interface GraphQLDiscussionNode {
  body: string;
  category: { id: string; name: string };
  createdAt: string;
  id: string;
  labels: { nodes: Array<{ name: string }> };
  number: number;
  title: string;
  updatedAt: string;
  url: string;
}

interface GraphQLDiscussionCategoryNode {
  id: string;
  name: string;
}

interface GraphQLDiscussionsPage {
  repository: {
    discussions: {
      nodes: GraphQLDiscussionNode[];
      pageInfo: { endCursor: string; hasNextPage: boolean };
    };
  };
}

export class GitHubDiscussionSource implements IGitHubSource {
  constructor(
    private readonly octokit: Octokit,
    private readonly config: IntegrationConfig,
  ) {}

  public testConnection(): Promise<ConnectionTestResult> {
    return verifyGitHubConnection(this.octokit, this.config);
  }

  public listRemoteDatabases(): Promise<RemoteDatabase[]> {
    return listAccessibleRepos(this.octokit, this.config, repo => repo.has_discussions === true);
  }

  public async getRemoteDatabaseSchema(repoFullName: string): Promise<RemoteDatabaseSchema> {
    const { owner, repo } = parseRepoFullName(repoFullName);

    const { repository } = await this.octokit.graphql<{
      repository: { discussionCategories: { nodes: GraphQLDiscussionCategoryNode[] } };
    }>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          discussionCategories(first: 25) {
            nodes { id name }
          }
        }
      }`,
      { owner, repo },
    );

    const categories = repository.discussionCategories.nodes;

    const { data: labels } = await this.octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100,
    });

    const labelOptions = labels
      .filter(l => !isRoadmapsFacilesLabel(l.name))
      .map(l => ({ id: l.name, name: l.name, color: l.color ?? undefined }));

    return {
      id: repoFullName,
      name: repoFullName,
      properties: [
        { id: "title", name: "Title", type: "title" },
        { id: "body", name: "Body", type: "rich_text" },
        {
          id: "category",
          name: "Category",
          type: "select",
          options: categories.map(c => ({ id: c.id, name: c.name })),
        },
        { id: "labels", name: "Labels", type: "multi_select", options: labelOptions },
      ],
    };
  }

  public async syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult> {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);

    if (existingRemoteId) {
      const discussionId = existingRemoteId;
      try {
        const result = await this.octokit.graphql<{
          updateDiscussion: { discussion: { id: string; url: string } };
        }>(
          `mutation($id: ID!, $title: String!, $body: String!) {
            updateDiscussion(input: { discussionId: $id, title: $title, body: $body }) {
              discussion { id url }
            }
          }`,
          { id: discussionId, title: post.title, body: post.description ?? "" },
        );
        return {
          success: true,
          remoteId: discussionId,
          remoteUrl: result.updateDiscussion.discussion.url,
        };
      } catch (error) {
        return { success: false, remoteId: discussionId, error: (error as Error).message };
      }
    }

    const categoryId = this.resolveCategoryId(post.boardId);
    if (!categoryId) {
      return { success: false, remoteId: "", error: "No discussion category mapped for this board" };
    }

    const { repository } = await this.octokit.graphql<{ repository: { id: string } }>(
      `query($owner: String!, $repo: String!) { repository(owner: $owner, name: $repo) { id } }`,
      { owner, repo },
    );

    try {
      const result = await this.octokit.graphql<{
        createDiscussion: { discussion: { id: string; number: number; url: string } };
      }>(
        `mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
          createDiscussion(input: { repositoryId: $repoId, categoryId: $categoryId, title: $title, body: $body }) {
            discussion { id number url }
          }
        }`,
        { repoId: repository.id, categoryId, title: post.title, body: post.description ?? "" },
      );

      return {
        success: true,
        remoteId: result.createDiscussion.discussion.id,
        remoteUrl: result.createDiscussion.discussion.url,
      };
    } catch (error) {
      return { success: false, remoteId: "", error: (error as Error).message };
    }
  }

  public async *syncInboundStream(since?: Date): AsyncGenerator<InboundChange> {
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    let shouldContinue = true;
    let cursor: null | string = null;

    while (shouldContinue) {
      const response: GraphQLDiscussionsPage = await this.octokit.graphql(
        `query($owner: String!, $repo: String!, $cursor: String) {
          repository(owner: $owner, name: $repo) {
            discussions(first: 50, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
              nodes {
                id number title body url createdAt updatedAt
                category { id name }
                labels(first: 20) { nodes { name } }
              }
              pageInfo { hasNextPage endCursor }
            }
          }
        }`,
        { owner, repo, cursor },
      );

      const discussions = response.repository.discussions;
      for (const disc of discussions.nodes) {
        if (since && new Date(disc.updatedAt) < since) {
          shouldContinue = false;
          break;
        }
        yield this.discussionToInboundChange(disc);
      }

      shouldContinue = shouldContinue && discussions.pageInfo.hasNextPage;
      cursor = discussions.pageInfo.endCursor;
    }
  }

  public async countInbound(since?: Date): Promise<number> {
    let count = 0;
    for await (const _ of this.syncInboundStream(since)) {
      void _;
      count++;
    }
    return count;
  }

  public async getInboundChange(remoteId: string): Promise<InboundChange | null> {
    try {
      const result = await this.octokit.graphql<{ node: GraphQLDiscussionNode | null }>(
        `query($id: ID!) {
          node(id: $id) {
            ... on Discussion {
              id number title body url createdAt updatedAt
              category { id name }
              labels(first: 20) { nodes { name } }
            }
          }
        }`,
        { id: remoteId },
      );
      if (!result.node) return null;
      return this.discussionToInboundChange(result.node);
    } catch {
      return null;
    }
  }

  public async getPageContent(remoteId: string): Promise<string | undefined> {
    const change = await this.getInboundChange(remoteId);
    return change?.description;
  }

  public buildRemoteUrl(remoteId: string): string {
    void remoteId;
    const { owner, repo } = parseRepoFullName(this.config.databaseId);
    return `https://github.com/${owner}/${repo}/discussions`;
  }

  private resolveCategoryId(boardId: number): string | undefined {
    const entry = Object.entries(this.config.boardMapping).find(([, v]) => v.localId === boardId);
    return entry?.[0];
  }

  private discussionToInboundChange(disc: GraphQLDiscussionNode): InboundChange {
    const labels = disc.labels.nodes.map(l => l.name);

    let statusRemoteOptionId: string | undefined;
    const tags: string[] = [];

    for (const label of labels) {
      const statusName = parseStatusLabel(label);
      if (statusName) {
        const entry = Object.entries(this.config.statusMapping).find(([, v]) => v.remoteName === statusName);
        if (entry) statusRemoteOptionId = entry[0];
        continue;
      }
      if (!isRoadmapsFacilesLabel(label)) {
        tags.push(label);
      }
    }

    const boardRemoteOptionId = disc.category?.id;

    return {
      remoteId: disc.id,
      remoteUrl: disc.url,
      title: disc.title,
      date: disc.createdAt,
      description: disc.body ?? undefined,
      lastEditedTime: disc.updatedAt,
      tags,
      statusRemoteOptionId,
      boardRemoteOptionId,
    };
  }
}
