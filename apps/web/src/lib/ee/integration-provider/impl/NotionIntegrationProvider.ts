import "server-only";
import { Client, isFullDataSource, isFullPage } from "@notionhq/client";
import {
  type BlockObjectRequest,
  type CreatePageParameters,
  type DataSourceObjectResponse,
  type PageObjectResponse,
  type UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

import { type IIntegrationProvider } from "../IIntegrationProvider";
import {
  type ConnectionTestResult,
  type InboundChange,
  type IntegrationConfig,
  type PostSyncData,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type RemoteProperty,
  type RemotePropertyType,
  type SyncResult,
} from "../types";

const NOTION_PROPERTY_TYPES = new Set<RemotePropertyType>([
  "title",
  "rich_text",
  "select",
  "status",
  "multi_select",
  "number",
  "date",
  "created_time",
]);

type NotionPageProperties = NonNullable<UpdatePageParameters["properties"]>;
type DataSourceProperty = DataSourceObjectResponse["properties"][string];

export class NotionIntegrationProvider implements IIntegrationProvider {
  private readonly client: Client;
  private readonly config: IntegrationConfig;

  constructor(integrationConfig: IntegrationConfig) {
    this.config = integrationConfig;
    this.client = new Client({
      auth: integrationConfig.apiKey,
      timeoutMs: 30_000,
    });
  }

  public async testConnection(): Promise<ConnectionTestResult> {
    try {
      const me = await this.client.users.me({});
      return {
        success: true,
        botName: me.name ?? undefined,
        workspaceId: me.id,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async listRemoteDatabases(): Promise<RemoteDatabase[]> {
    const databases: RemoteDatabase[] = [];
    const response = await this.client.search({
      filter: { property: "object", value: "data_source" },
    });

    const parentPageIds = new Set<string>();

    for (const item of response.results) {
      if (isFullDataSource(item)) {
        const icon =
          item.icon?.type === "emoji"
            ? { type: "emoji" as const, emoji: item.icon.emoji }
            : item.icon?.type === "external"
              ? { type: "url" as const, url: item.icon.external.url }
              : item.icon?.type === "file"
                ? { type: "url" as const, url: item.icon.file.url }
                : undefined;
        const description = item.description?.map(t => t.plain_text).join("") || undefined;
        const parentPageId = item.database_parent.type === "page_id" ? item.database_parent.page_id : undefined;
        if (parentPageId) parentPageIds.add(parentPageId);
        databases.push({
          id: item.id,
          name: item.title.map(t => t.plain_text).join("") || "Untitled",
          url: item.url,
          icon,
          description,
          propertyCount: Object.keys(item.properties).length,
          parentName: parentPageId,
        });
      }
    }

    // Resolve parent page titles in parallel
    if (parentPageIds.size > 0) {
      const parentTitles = new Map<string, string>();
      await Promise.allSettled(
        [...parentPageIds].map(async pageId => {
          const page = await this.client.pages.retrieve({ page_id: pageId });
          if (isFullPage(page)) {
            const titleProp = Object.values(page.properties).find(p => p.type === "title");
            if (titleProp?.type === "title") {
              parentTitles.set(pageId, titleProp.title.map(t => t.plain_text).join("") || "Untitled");
            }
          }
        }),
      );
      for (const db of databases) {
        if (db.parentName && parentTitles.has(db.parentName)) {
          db.parentName = parentTitles.get(db.parentName);
        } else {
          db.parentName = undefined;
        }
      }
    }

    return databases;
  }

  public async getRemoteDatabaseSchema(databaseId: string): Promise<RemoteDatabaseSchema> {
    const ds = await this.client.dataSources.retrieve({ data_source_id: databaseId });

    if (!isFullDataSource(ds)) {
      throw new Error("Could not retrieve full data source schema");
    }

    const properties: RemoteProperty[] = [];

    for (const [name, prop] of Object.entries(ds.properties)) {
      if (!NOTION_PROPERTY_TYPES.has(prop.type as RemotePropertyType)) continue;

      const remoteProp: RemoteProperty = {
        id: prop.id,
        name,
        type: prop.type as RemotePropertyType,
      };

      const options = this.extractPropertyOptions(prop);
      if (options) remoteProp.options = options;

      properties.push(remoteProp);
    }

    return {
      id: ds.id,
      name: ds.title.map(t => t.plain_text).join("") || "Untitled",
      properties,
    };
  }

  public async syncOutbound(post: PostSyncData, existingRemoteId?: string): Promise<SyncResult> {
    try {
      const properties = this.buildNotionProperties(post);

      if (existingRemoteId) {
        const page = await this.client.pages.update({
          page_id: existingRemoteId,
          properties,
        });
        return { success: true, remoteId: page.id, remoteUrl: this.buildRemoteUrl(page.id) };
      }

      const children = this.buildPageContent(post);
      const createParams: CreatePageParameters = {
        parent: { type: "database_id", database_id: this.config.databaseId },
        properties,
        children,
      };
      const page = await this.client.pages.create(createParams);
      return { success: true, remoteId: page.id, remoteUrl: this.buildRemoteUrl(page.id) };
    } catch (error) {
      return { success: false, remoteId: existingRemoteId ?? "", error: (error as Error).message };
    }
  }

  public async countInbound(since?: Date): Promise<number> {
    const filter = since
      ? { timestamp: "last_edited_time" as const, last_edited_time: { after: since.toISOString() } }
      : undefined;

    let count = 0;
    let cursor: null | string = null;
    do {
      const response = await this.client.dataSources.query({
        data_source_id: this.config.databaseId,
        filter,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      });
      count += response.results.filter(page => isFullPage(page)).length;
      cursor = response.has_more ? response.next_cursor : null;
    } while (cursor);

    return count;
  }

  public async syncInbound(since?: Date): Promise<InboundChange[]> {
    const changes: InboundChange[] = [];
    for await (const change of this.syncInboundStream(since)) {
      changes.push(change);
    }
    return changes;
  }

  public async *syncInboundStream(since?: Date): AsyncGenerator<InboundChange> {
    const filter = since
      ? { timestamp: "last_edited_time" as const, last_edited_time: { after: since.toISOString() } }
      : undefined;

    let cursor: null | string = null;
    do {
      const response = await this.client.dataSources.query({
        data_source_id: this.config.databaseId,
        filter,
        sorts: [{ timestamp: "last_edited_time", direction: "ascending" }],
        ...(cursor ? { start_cursor: cursor } : {}),
        page_size: 100,
      });

      for (const page of response.results) {
        if (!isFullPage(page)) continue;

        const change = this.extractInboundChange(page);
        if (!change) continue;

        // Content reading is deferred to getPageContent() for parallel fetching
        yield change;
      }

      cursor = response.has_more ? response.next_cursor : null;
    } while (cursor);
  }

  public async getInboundChange(remoteId: string): Promise<InboundChange | null> {
    try {
      const page = await this.client.pages.retrieve({ page_id: remoteId });
      if (!isFullPage(page)) return null;
      const change = this.extractInboundChange(page);
      if (!change) return null;
      // Resolve page content if configured
      if (this.config.propertyMapping.description?.type === "page_content") {
        change.description = await this.readPageContent(remoteId);
      }
      return change;
    } catch {
      return null;
    }
  }

  public async getPageContent(remoteId: string): Promise<string | undefined> {
    if (this.config.propertyMapping.description?.type !== "page_content") return undefined;
    return this.readPageContent(remoteId);
  }

  public buildRemoteUrl(remoteId: string): string {
    const cleanId = remoteId.replace(/-/g, "");
    return `https://www.notion.so/${cleanId}`;
  }

  public async updateCommentsField(
    remoteId: string,
    count: number,
    tenantUrl: string,
    postPath: string,
  ): Promise<void> {
    const fieldName = this.config.propertyMapping.commentsInfo;
    if (!fieldName) return;

    const url = `${tenantUrl}${postPath}`;
    const text = count > 0 ? `${count} commentaire${count > 1 ? "s" : ""} — Voir sur ${url}` : `Voir sur ${url}`;

    await this.client.pages.update({
      page_id: remoteId,
      properties: {
        [fieldName]: {
          rich_text: [{ type: "text", text: { content: text, link: { url } } }],
        },
      },
    });
  }

  public async updateLikesField(remoteId: string, count: number): Promise<void> {
    const likesConfig = this.config.propertyMapping.likes;
    if (!likesConfig) return;

    // Backward compat: plain string → assume number type
    const fieldName = typeof likesConfig === "string" ? likesConfig : likesConfig.name;
    const fieldType = typeof likesConfig === "string" ? "number" : likesConfig.type;

    const numberProp = { number: count };
    const richTextProp = { rich_text: [{ type: "text" as const, text: { content: String(count) } }] };
    const primary = fieldType === "rich_text" ? richTextProp : numberProp;
    const fallback = fieldType === "rich_text" ? numberProp : richTextProp;

    try {
      await this.client.pages.update({
        page_id: remoteId,
        properties: { [fieldName]: primary },
      });
    } catch (error) {
      // Type mismatch (old config or wrong mapping) — try the other type
      if ((error as { code?: string }).code === "validation_error") {
        await this.client.pages.update({
          page_id: remoteId,
          properties: { [fieldName]: fallback },
        });
      } else {
        throw error;
      }
    }
  }

  // --- Private helpers ---

  private extractPropertyOptions(
    prop: DataSourceProperty,
  ): Array<{ color: string; id: string; name: string }> | undefined {
    if (prop.type === "select") {
      return prop.select.options.map(o => ({ id: o.id, name: o.name, color: o.color }));
    }
    if (prop.type === "status") {
      return prop.status.options.map(o => ({ id: o.id, name: o.name, color: o.color }));
    }
    if (prop.type === "multi_select") {
      return prop.multi_select.options.map(o => ({ id: o.id, name: o.name, color: o.color }));
    }
    return undefined;
  }

  private buildNotionProperties(post: PostSyncData): NotionPageProperties {
    const { propertyMapping, statusMapping } = this.config;
    const properties: NotionPageProperties = {};

    // Title
    properties[propertyMapping.title] = {
      title: [{ type: "text", text: { content: post.title } }],
    };

    // Description (as property if configured)
    if (propertyMapping.description && propertyMapping.description.type === "property" && post.description) {
      properties[propertyMapping.description.name] = {
        rich_text: [{ type: "text", text: { content: post.description.slice(0, 2000) } }],
      };
    }

    // Status
    if (propertyMapping.status && post.postStatusId) {
      const statusEntry = Object.values(statusMapping).find(m => m.localId === post.postStatusId);
      if (statusEntry) {
        properties[propertyMapping.status.name] =
          propertyMapping.status.type === "status"
            ? { status: { name: statusEntry.notionName } }
            : { select: { name: statusEntry.notionName } };
      }
    }

    // Tags
    if (propertyMapping.tags && post.tags.length > 0) {
      properties[propertyMapping.tags] = {
        multi_select: post.tags.map(tag => ({ name: tag })),
      };
    }

    // Date (only writable for "date" type — "created_time" is read-only in Notion)
    if (propertyMapping.date?.type === "date") {
      properties[propertyMapping.date.name] = {
        date: { start: post.createdAt.toISOString() },
      };
    }

    return properties;
  }

  private buildPageContent(post: PostSyncData): BlockObjectRequest[] {
    const { propertyMapping } = this.config;

    // If description is mapped as page content, add it as blocks
    if (propertyMapping.description?.type === "page_content" && post.description) {
      return this.markdownToBlocks(post.description);
    }

    return [];
  }

  private markdownToBlocks(markdown: string): BlockObjectRequest[] {
    const blocks: BlockObjectRequest[] = [];
    const lines = markdown.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Headings
      if (trimmed.startsWith("### ")) {
        blocks.push({
          object: "block",
          type: "heading_3",
          heading_3: { rich_text: [{ type: "text", text: { content: trimmed.slice(4) } }] },
        });
      } else if (trimmed.startsWith("## ")) {
        blocks.push({
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ type: "text", text: { content: trimmed.slice(3) } }] },
        });
      } else if (trimmed.startsWith("# ")) {
        blocks.push({
          object: "block",
          type: "heading_1",
          heading_1: { rich_text: [{ type: "text", text: { content: trimmed.slice(2) } }] },
        });
      }
      // Bullet list
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: { rich_text: [{ type: "text", text: { content: trimmed.slice(2) } }] },
        });
      }
      // Code block (single backtick line — simplified)
      else if (trimmed.startsWith("```")) {
        // Skip code fence markers — content between fences handled by paragraph fallback
        continue;
      }
      // Paragraph
      else {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: trimmed.slice(0, 2000) } }] },
        });
      }
    }

    return blocks;
  }

  private async readPageContent(pageId: string): Promise<string> {
    const lines: string[] = [];
    let cursor: null | string = null;

    do {
      const response = await this.client.blocks.children.list({
        block_id: pageId,
        ...(cursor ? { start_cursor: cursor } : {}),
      });

      for (const block of response.results) {
        const b = block as { type: string } & Record<string, unknown>;
        const richText = (b[b.type] as { rich_text?: Array<{ plain_text: string }> } | undefined)?.rich_text;
        const text = richText?.map(t => t.plain_text).join("") ?? "";

        switch (b.type) {
          case "heading_1":
            lines.push(`# ${text}`);
            break;
          case "heading_2":
            lines.push(`## ${text}`);
            break;
          case "heading_3":
            lines.push(`### ${text}`);
            break;
          case "bulleted_list_item":
            lines.push(`- ${text}`);
            break;
          case "numbered_list_item":
            lines.push(`1. ${text}`);
            break;
          case "to_do": {
            const checked = (b[b.type] as { checked?: boolean } | undefined)?.checked;
            lines.push(`- [${checked ? "x" : " "}] ${text}`);
            break;
          }
          case "code": {
            const language = (b[b.type] as { language?: string } | undefined)?.language ?? "";
            lines.push(`\`\`\`${language}`, text, "```");
            break;
          }
          case "divider":
            lines.push("---");
            break;
          case "paragraph":
          default:
            if (text) lines.push(text);
            else lines.push("");
            break;
        }
      }

      cursor = response.has_more ? response.next_cursor : null;
    } while (cursor);

    return lines.join("\n");
  }

  private extractInboundChange(page: PageObjectResponse): InboundChange | null {
    const { propertyMapping } = this.config;
    const props = page.properties;

    const titleProp = props[propertyMapping.title];
    const title = extractTitle(titleProp);
    if (!title) return null;

    const change: InboundChange = {
      remoteId: page.id,
      remoteUrl: page.url,
      title,
      lastEditedTime: page.last_edited_time,
    };

    // Description from property
    if (propertyMapping.description?.type === "property") {
      const descProp = props[propertyMapping.description.name];
      change.description = extractRichText(descProp);
    }

    // Status
    if (propertyMapping.status) {
      const statusProp = props[propertyMapping.status.name];
      const optionId = extractSelectOptionId(statusProp);
      if (optionId) change.statusNotionOptionId = optionId;
    }

    // Board
    if (propertyMapping.board) {
      const boardProp = props[propertyMapping.board.name];
      const optionId = extractSelectOptionId(boardProp);
      if (optionId) change.boardNotionOptionId = optionId;
    }

    // Tags
    if (propertyMapping.tags) {
      const tagsProp = props[propertyMapping.tags];
      change.tags = extractMultiSelect(tagsProp);
    }

    // Date
    if (propertyMapping.date) {
      const dateProp = props[propertyMapping.date.name];
      change.date = extractDate(dateProp);
    }

    return change;
  }
}

// --- Notion property value extractors ---

type PageProperty = PageObjectResponse["properties"][string];

function extractTitle(prop: PageProperty | undefined): string | undefined {
  if (!prop || prop.type !== "title") return undefined;
  return prop.title.map(t => t.plain_text).join("");
}

function extractRichText(prop: PageProperty | undefined): string | undefined {
  if (!prop || prop.type !== "rich_text") return undefined;
  return prop.rich_text.map(t => t.plain_text).join("");
}

function extractSelectOptionId(prop: PageProperty | undefined): string | undefined {
  if (!prop) return undefined;
  if (prop.type === "select" && prop.select) return prop.select.id;
  if (prop.type === "status" && prop.status) return prop.status.id;
  return undefined;
}

function extractMultiSelect(prop: PageProperty | undefined): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map(o => o.name);
}

function extractDate(prop: PageProperty | undefined): string | undefined {
  if (!prop) return undefined;
  // Date property: { start, end } — take start
  if (prop.type === "date" && prop.date) return prop.date.start;
  // Created time property: ISO string directly
  if (prop.type === "created_time") return prop.created_time;
  return undefined;
}
