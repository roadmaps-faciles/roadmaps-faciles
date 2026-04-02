import "server-only";

export type ConnectionTestResult = {
  botName?: string;
  success: boolean;
  workspaceId?: string;
  workspaceName?: string;
} & ({ error: string; success: false } | { success: true });

export type RemoteDatabaseIcon = { emoji: string; type: "emoji" } | { type: "url"; url: string };

export interface RemoteDatabase {
  description?: string;
  icon?: RemoteDatabaseIcon;
  id: string;
  name: string;
  parentName?: string;
  propertyCount: number;
  url: string;
}

export type RemotePropertyType =
  | "created_time"
  | "date"
  | "multi_select"
  | "number"
  | "rich_text"
  | "select"
  | "status"
  | "title";

export interface RemotePropertyOption {
  color?: string;
  id: string;
  name: string;
}

export interface RemoteProperty {
  id: string;
  name: string;
  options?: RemotePropertyOption[];
  type: RemotePropertyType;
}

export interface RemoteDatabaseSchema {
  id: string;
  name: string;
  properties: RemoteProperty[];
}

export type MappedPropertyType = "select" | "status";

export interface PropertyMappingConfig {
  board?: { name: string; type: MappedPropertyType };
  commentsInfo?: string;
  date?: { name: string; type: "created_time" | "date" };
  description?: { name: string; type: "property" } | { type: "page_content" };
  likes?: { name: string; type: "number" | "rich_text" } | string;
  status?: { name: string; type: MappedPropertyType };
  tags?: string;
  title: string;
}

export interface ValueMapping {
  localId: number;
  notionName: string;
}

export interface IntegrationConfig {
  apiKey: string;
  boardMapping: Record<string, ValueMapping>;
  databaseId: string;
  databaseName: string;
  defaultBoardId?: number;
  lastSyncCursor?: string;
  propertyMapping: PropertyMappingConfig;
  statusMapping: Record<string, ValueMapping>;
  syncDirection: "bidirectional" | "inbound" | "outbound";
}

export interface SyncResult {
  error?: string;
  remoteId: string;
  remoteUrl?: string;
  success: boolean;
}

export interface InboundChange {
  boardNotionOptionId?: string;
  date?: string;
  description?: string;
  lastEditedTime: string;
  remoteId: string;
  remoteUrl: string;
  statusNotionOptionId?: string;
  tags?: string[];
  title: string;
}

export interface PostSyncData {
  boardId: number;
  commentCount: number;
  createdAt: Date;
  description: null | string;
  likeCount: number;
  postId: number;
  postStatusId: null | number;
  slug: null | string;
  tags: string[];
  tenantUrl: string;
  title: string;
}

export interface CronExecutionReport {
  errors: Array<{ error: string; integrationId: number }>;
  processed: number;
  skipped: number;
}
