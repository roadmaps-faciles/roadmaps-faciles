import "server-only";

import { type IIntegrationProvider } from "../../IIntegrationProvider";
import {
  type ConnectionTestResult,
  type InboundChange,
  type IntegrationConfig,
  type PostSyncData,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type SyncResult,
} from "../../types";
import { createGitHubClient } from "./GitHubAuth";
import { GitHubIssueSource } from "./GitHubIssueSource";

export class GitHubIntegrationProvider implements IIntegrationProvider {
  private readonly source: GitHubIssueSource;

  constructor(config: IntegrationConfig) {
    const octokit = createGitHubClient(config);
    const sourceType = config.sourceType ?? "issues";

    switch (sourceType) {
      case "issues":
        this.source = new GitHubIssueSource(octokit, config);
        break;
      case "discussions":
      case "project":
        // TODO: implement GitHubDiscussionSource and GitHubProjectSource
        throw new Error(`GitHub source type "${sourceType}" is not yet implemented`);
      default:
        throw new Error(`Unknown GitHub source type: ${sourceType as string}`);
    }
  }

  testConnection(): Promise<ConnectionTestResult> {
    return this.source.testConnection();
  }

  listRemoteDatabases(): Promise<RemoteDatabase[]> {
    return this.source.listRemoteDatabases();
  }

  getRemoteDatabaseSchema(databaseId: string): Promise<RemoteDatabaseSchema> {
    return this.source.getRemoteDatabaseSchema(databaseId);
  }

  syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult> {
    return this.source.syncOutbound(post, existingRemoteId);
  }

  syncInbound(since?: Date): Promise<InboundChange[]> {
    return this.collectStream(this.source.syncInboundStream(since));
  }

  async *syncInboundStream(since?: Date): AsyncGenerator<InboundChange> {
    yield* this.source.syncInboundStream(since);
  }

  countInbound(since?: Date): Promise<number> {
    return this.source.countInbound(since);
  }

  getInboundChange(remoteId: string): Promise<InboundChange | null> {
    return this.source.getInboundChange(remoteId);
  }

  getPageContent(remoteId: string): Promise<string | undefined> {
    return this.source.getPageContent(remoteId);
  }

  buildRemoteUrl(remoteId: string): string {
    return this.source.buildRemoteUrl(remoteId);
  }

  async updateCommentsField(): Promise<void> {
    // No-op: GitHub issues don't have custom fields for comments info
  }

  async updateLikesField(): Promise<void> {
    // No-op: GitHub issues don't have custom fields for likes
  }

  private async collectStream(gen: AsyncGenerator<InboundChange>): Promise<InboundChange[]> {
    const results: InboundChange[] = [];
    for await (const change of gen) {
      results.push(change);
    }
    return results;
  }
}
