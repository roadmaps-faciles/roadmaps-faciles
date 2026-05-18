import "server-only";

import {
  type ConnectionTestResult,
  type InboundChange,
  type PostSyncData,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type SyncResult,
} from "../../types";

export interface IGitHubSource {
  buildRemoteUrl(remoteId: string): string;
  countInbound(since?: Date): Promise<number>;
  getInboundChange(remoteId: string): Promise<InboundChange | null>;
  getPageContent(remoteId: string): Promise<string | undefined>;
  getRemoteDatabaseSchema(databaseId: string): Promise<RemoteDatabaseSchema>;
  listRemoteDatabases(): Promise<RemoteDatabase[]>;
  syncInboundStream(since?: Date): AsyncGenerator<InboundChange>;
  syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult>;
  testConnection(): Promise<ConnectionTestResult>;
  updateRemoteStats?(
    remoteId: string,
    stats: { commentCount: number; likeCount: number; postPath: string; tenantUrl: string },
    hints?: { statsCommentId?: number },
  ): Promise<{ statsCommentId?: number } | void>;
}
