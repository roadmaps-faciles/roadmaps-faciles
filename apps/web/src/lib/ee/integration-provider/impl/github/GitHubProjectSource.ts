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
import { type IGitHubSource } from "./IGitHubSource";
import { parseRepoFullName } from "./types";

interface ProjectV2Node {
  id: string;
  number: number;
  title: string;
  url: string;
}

interface ProjectV2FieldNode {
  id: string;
  name: string;
  options?: Array<{ id: string; name: string }>;
}

interface ProjectV2ItemNode {
  content: {
    __typename: string;
    body?: string;
    createdAt?: string;
    number?: number;
    title?: string;
    updatedAt?: string;
    url?: string;
  } | null;
  fieldValues: {
    nodes: Array<{
      field?: { name: string };
      name?: string;
    }>;
  };
  id: string;
  updatedAt: string;
}

interface GraphQLProjectV2ItemsPage {
  node: {
    items: {
      nodes: ProjectV2ItemNode[];
      pageInfo: { endCursor: string; hasNextPage: boolean };
    };
  };
}

export class GitHubProjectSource implements IGitHubSource {
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
    if (!this.config.databaseId) {
      throw new Error("ProjectSource requires a repository to list projects");
    }
    const { owner, repo } = parseRepoFullName(this.config.databaseId);

    const result = await this.octokit.graphql<{
      repository: {
        projectsV2: { nodes: ProjectV2Node[] };
      };
    }>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          projectsV2(first: 20) {
            nodes { id number title url }
          }
        }
      }`,
      { owner, repo },
    );

    return result.repository.projectsV2.nodes.map(p => ({
      id: p.id,
      name: `${owner}/${repo} — ${p.title}`,
      description: `Project #${p.number}`,
      url: p.url,
      propertyCount: 0,
      parentName: `${owner}/${repo}`,
    }));
  }

  async getRemoteDatabaseSchema(projectId: string): Promise<RemoteDatabaseSchema> {
    const result = await this.octokit.graphql<{
      node: {
        fields: { nodes: ProjectV2FieldNode[] };
        title: string;
      };
    }>(
      `query($id: ID!) {
        node(id: $id) {
          ... on ProjectV2 {
            title
            fields(first: 30) {
              nodes {
                ... on ProjectV2SingleSelectField {
                  id name options { id name }
                }
                ... on ProjectV2Field {
                  id name
                }
              }
            }
          }
        }
      }`,
      { id: projectId },
    );

    const statusField = result.node.fields.nodes.find(f => f.name === "Status" && f.options);

    return {
      id: projectId,
      name: result.node.title,
      properties: [
        { id: "title", name: "Title", type: "title" as const },
        { id: "body", name: "Body", type: "rich_text" as const },
        ...(statusField
          ? [
              {
                id: statusField.id,
                name: "Status",
                type: "status" as const,
                options: statusField.options!.map(o => ({ id: o.id, name: o.name })),
              },
            ]
          : []),
      ],
    };
  }

  async syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult> {
    if (!existingRemoteId) {
      return { success: false, remoteId: "", error: "Cannot create project items — link existing issues instead" };
    }

    const statusEntry = post.postStatusId
      ? Object.entries(this.config.statusMapping).find(([, v]) => v.localId === post.postStatusId)
      : undefined;

    if (statusEntry) {
      const [statusOptionId] = statusEntry;
      const statusField = await this.findStatusFieldId();
      if (statusField) {
        try {
          await this.octokit.graphql(
            `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
              updateProjectV2ItemFieldValue(input: {
                projectId: $projectId, itemId: $itemId,
                fieldId: $fieldId, value: { singleSelectOptionId: $optionId }
              }) { projectV2Item { id } }
            }`,
            {
              projectId: this.config.databaseId,
              itemId: existingRemoteId,
              fieldId: statusField,
              optionId: statusOptionId,
            },
          );
        } catch (error) {
          return { success: false, remoteId: existingRemoteId, error: (error as Error).message };
        }
      }
    }

    return { success: true, remoteId: existingRemoteId };
  }

  async *syncInboundStream(since?: Date): AsyncGenerator<InboundChange> {
    let shouldContinue = true;
    let cursor: null | string = null;

    while (shouldContinue) {
      const response: GraphQLProjectV2ItemsPage = await this.octokit.graphql(
        `query($id: ID!, $cursor: String) {
          node(id: $id) {
            ... on ProjectV2 {
              items(first: 50, after: $cursor) {
                nodes {
                  id updatedAt
                  content {
                    __typename
                    ... on Issue { number title body url createdAt updatedAt }
                    ... on PullRequest { number title body url createdAt updatedAt }
                  }
                  fieldValues(first: 10) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name field { ... on ProjectV2SingleSelectField { name } }
                      }
                    }
                  }
                }
                pageInfo { hasNextPage endCursor }
              }
            }
          }
        }`,
        { id: this.config.databaseId, cursor },
      );

      const items = response.node.items;
      for (const item of items.nodes) {
        if (!item.content || item.content.__typename === "DraftIssue") continue;
        if (since && new Date(item.updatedAt) < since) continue;
        yield this.itemToInboundChange(item);
      }

      shouldContinue = shouldContinue && items.pageInfo.hasNextPage;
      cursor = items.pageInfo.endCursor;
    }
  }

  async countInbound(since?: Date): Promise<number> {
    let count = 0;
    for await (const _ of this.syncInboundStream(since)) {
      void _;
      count++;
    }
    return count;
  }

  async getInboundChange(remoteId: string): Promise<InboundChange | null> {
    try {
      const result = await this.octokit.graphql<{ node: null | ProjectV2ItemNode }>(
        `query($id: ID!) {
          node(id: $id) {
            ... on ProjectV2Item {
              id updatedAt
              content {
                __typename
                ... on Issue { number title body url createdAt updatedAt }
                ... on PullRequest { number title body url createdAt updatedAt }
              }
              fieldValues(first: 10) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name field { ... on ProjectV2SingleSelectField { name } }
                  }
                }
              }
            }
          }
        }`,
        { id: remoteId },
      );
      if (!result.node?.content) return null;
      return this.itemToInboundChange(result.node);
    } catch {
      return null;
    }
  }

  async getPageContent(remoteId: string): Promise<string | undefined> {
    const change = await this.getInboundChange(remoteId);
    return change?.description;
  }

  buildRemoteUrl(_remoteId: string): string {
    return "";
  }

  private async findStatusFieldId(): Promise<string | undefined> {
    const result = await this.octokit.graphql<{
      node: { fields: { nodes: Array<{ id: string; name: string }> } };
    }>(
      `query($id: ID!) {
        node(id: $id) {
          ... on ProjectV2 {
            fields(first: 30) {
              nodes {
                ... on ProjectV2SingleSelectField { id name }
              }
            }
          }
        }
      }`,
      { id: this.config.databaseId },
    );
    const statusField = result.node.fields.nodes.find(f => f.name === "Status");
    return statusField?.id;
  }

  private itemToInboundChange(item: ProjectV2ItemNode): InboundChange {
    const content = item.content!;

    const statusValue = item.fieldValues.nodes.find(fv => fv.field?.name === "Status");
    let statusRemoteOptionId: string | undefined;

    if (statusValue?.name) {
      const entry = Object.entries(this.config.statusMapping).find(([, v]) => v.remoteName === statusValue.name);
      if (entry) statusRemoteOptionId = entry[0];
    }

    return {
      remoteId: item.id,
      date: content.createdAt,
      remoteUrl: content.url ?? "",
      title: content.title ?? "",
      description: content.body ?? undefined,
      lastEditedTime: content.updatedAt ?? item.updatedAt,
      tags: [],
      statusRemoteOptionId,
    };
  }
}
