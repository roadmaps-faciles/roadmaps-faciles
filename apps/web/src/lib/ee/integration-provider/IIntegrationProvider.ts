import "server-only";

import {
  type ConnectionTestResult,
  type InboundChange,
  type PostSyncData,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type SyncResult,
} from "./types";

export interface IIntegrationProvider {
  /** Build a user-facing URL for a remote resource */
  buildRemoteUrl(remoteId: string): string;

  /** Count inbound changes without fetching content (fast pagination for progress bar) */
  countInbound?(since?: Date): Promise<number>;

  /** Retrieve a single remote page as an InboundChange (avoids full DB scan) */
  getInboundChange?(remoteId: string): Promise<InboundChange | null>;

  /** Read page body content for a remote resource (e.g. Notion blocks → markdown) */
  getPageContent?(remoteId: string): Promise<string | undefined>;

  /** Retrieve the schema (properties) of a remote database */
  getRemoteDatabaseSchema(databaseId: string): Promise<RemoteDatabaseSchema>;

  /** List all databases accessible to the integration */
  listRemoteDatabases(): Promise<RemoteDatabase[]>;

  /** Pull changes from the remote service since a given date */
  syncInbound(since?: Date): Promise<InboundChange[]>;

  /** Pull changes incrementally with pagination — yields changes as they're fetched */
  syncInboundStream?(since?: Date): AsyncGenerator<InboundChange>;

  /** Push a post to the remote service (create or update) */
  syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult>;

  /** Validate the connection credentials */
  testConnection(): Promise<ConnectionTestResult>;

  /** Update the comments info field on a remote page */
  updateCommentsField(remoteId: string, count: number, tenantUrl: string, postPath: string): Promise<void>;

  /** Update the likes count field on a remote page */
  updateLikesField(remoteId: string, count: number): Promise<void>;
}
