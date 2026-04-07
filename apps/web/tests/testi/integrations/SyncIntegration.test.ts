import { SyncIntegration } from "@/useCases/ee/integrations/SyncIntegration";

import {
  createMockBoardRepo,
  createMockIntegrationMappingRepo,
  createMockIntegrationRepo,
  createMockPostRepo,
  createMockSyncLogRepo,
  fakeIntegration,
  fakeIntegrationMapping,
  fakePost,
  type createMockBoardRepo as CreateMockBoardRepo,
  type createMockIntegrationMappingRepo as CreateMockMappingRepo,
  type createMockIntegrationRepo as CreateMockIntegrationRepo,
  type createMockPostRepo as CreateMockPostRepo,
  type createMockSyncLogRepo as CreateMockSyncLogRepo,
} from "../helpers";

// Mock encryption
vi.mock("@/lib/ee/integration-provider/encryption", () => ({
  encrypt: vi.fn((val: string) => `encrypted:${val}`),
  decrypt: vi.fn((val: string) => val.replace("encrypted:", "")),
}));

// Mock provider
const mockSyncOutbound = vi.fn();
const mockSyncInbound = vi.fn();
const mockUpdateCommentsField = vi.fn();
const mockUpdateLikesField = vi.fn();
vi.mock("@/lib/ee/integration-provider", () => ({
  createIntegrationProvider: () => ({
    syncOutbound: mockSyncOutbound,
    syncInbound: mockSyncInbound,
    updateCommentsField: mockUpdateCommentsField,
    updateLikesField: mockUpdateLikesField,
  }),
}));

describe("SyncIntegration", () => {
  let mockIntegrationRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let mockMappingRepo: ReturnType<typeof CreateMockMappingRepo>;
  let mockSyncLogRepo: ReturnType<typeof CreateMockSyncLogRepo>;
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let mockBoardRepo: ReturnType<typeof CreateMockBoardRepo>;
  let useCase: SyncIntegration;

  const baseInput = { integrationId: 1, tenantId: 1, tenantUrl: "https://test.example.com" };

  beforeEach(() => {
    mockIntegrationRepo = createMockIntegrationRepo();
    mockMappingRepo = createMockIntegrationMappingRepo();
    mockSyncLogRepo = createMockSyncLogRepo();
    mockPostRepo = createMockPostRepo();
    mockBoardRepo = createMockBoardRepo();
    mockBoardRepo.findSlugById.mockResolvedValue("test-board");
    useCase = new SyncIntegration(mockIntegrationRepo, mockMappingRepo, mockSyncLogRepo, mockPostRepo, mockBoardRepo);
    mockSyncOutbound.mockReset();
    mockSyncInbound.mockReset();
    mockUpdateCommentsField.mockReset().mockResolvedValue(undefined);
    mockUpdateLikesField.mockReset().mockResolvedValue(undefined);
  });

  it("throws when integration not found", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow("Integration not found");
  });

  it("throws when tenant mismatch", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 99 }));

    await expect(useCase.execute(baseInput)).rejects.toThrow("Integration not found");
  });

  it("throws when integration is disabled", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1, enabled: false }));

    await expect(useCase.execute(baseInput)).rejects.toThrow("Integration is disabled");
  });

  describe("outbound sync", () => {
    const outboundIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      config: {
        apiKey: "encrypted:key",
        databaseId: "db-1",
        databaseName: "DB",
        propertyMapping: { title: "Name" },
        statusMapping: {},
        boardMapping: { "opt-1": { localId: 10, remoteName: "Board" } },
        syncDirection: "outbound",
      },
    });

    it("syncs posts outbound successfully", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 42, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockMappingRepo.findByLocalEntity.mockResolvedValue(null);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 2, likes: 5 });
      mockSyncOutbound.mockResolvedValue({ success: true, remoteId: "remote-1", remoteUrl: "https://notion.so/p1" });

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.findAllForBoards).toHaveBeenCalledWith([10], 1);
      expect(mockSyncOutbound).toHaveBeenCalledTimes(1);
      expect(mockMappingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          integrationId: 1,
          localType: "post",
          localId: 42,
          remoteId: "remote-1",
          metadata: { direction: "outbound" },
        }),
      );
      expect(mockSyncLogRepo.create).toHaveBeenCalled();
      expect(result.synced).toBe(1);
      expect(result.errors).toBe(0);
    });

    it("updates existing mapping on re-sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 42, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      const existing = fakeIntegrationMapping({ id: 5, integrationId: 1, localId: 42, remoteId: "remote-1" });
      mockMappingRepo.findByLocalEntity.mockResolvedValue(existing);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 0, likes: 0 });
      mockSyncOutbound.mockResolvedValue({ success: true, remoteId: "remote-1", remoteUrl: "https://notion.so/p1" });

      const result = await useCase.execute(baseInput);

      expect(mockMappingRepo.update).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ syncStatus: "SYNCED", lastError: null }),
      );
      expect(mockMappingRepo.create).not.toHaveBeenCalled();
      expect(result.synced).toBe(1);
    });

    it("skips inbound posts during outbound sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 42, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 2, likes: 5 });
      mockMappingRepo.findByLocalEntity.mockResolvedValue(
        fakeIntegrationMapping({ metadata: { direction: "inbound" } }),
      );

      const result = await useCase.execute(baseInput);

      expect(mockSyncOutbound).not.toHaveBeenCalled();
      expect(mockUpdateCommentsField).toHaveBeenCalled();
      expect(result.synced).toBe(0);
      expect(result.errors).toBe(0);
    });

    it("records error when provider sync fails", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 42, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockMappingRepo.findByLocalEntity.mockResolvedValue(null);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 0, likes: 0 });
      mockSyncOutbound.mockResolvedValue({ success: false, remoteId: "", error: "API error" });

      const result = await useCase.execute(baseInput);

      expect(mockSyncLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "ERROR", message: "API error" }),
      );
      expect(result.errors).toBe(1);
      expect(result.synced).toBe(0);
    });

    it("handles per-post exception gracefully", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 42, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockMappingRepo.findByLocalEntity.mockRejectedValue(new Error("DB down"));

      const result = await useCase.execute(baseInput);

      expect(result.errors).toBe(1);
      expect(result.synced).toBe(0);
    });

    it("returns empty result when no posts to sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      mockPostRepo.findAllForBoards.mockResolvedValue([]);

      const result = await useCase.execute(baseInput);

      expect(result.synced).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe("inbound sync", () => {
    const inboundIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      config: {
        apiKey: "encrypted:key",
        databaseId: "db-1",
        databaseName: "DB",
        propertyMapping: { title: "Name" },
        statusMapping: { "status-opt-1": { localId: 3, remoteName: "En cours" } },
        boardMapping: { "board-opt-1": { localId: 10, remoteName: "Board" } },
        syncDirection: "inbound",
      },
    });

    it("creates new posts from inbound changes", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "page-1",
          title: "Notion Post",
          description: "From Notion",
          remoteUrl: "https://notion.so/page-1",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
          statusRemoteOptionId: "status-opt-1",
          tags: ["tag1"],
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(null);
      mockPostRepo.create.mockResolvedValue(fakePost({ id: 100 }));

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Notion Post",
          description: "From Notion",
          boardId: 10,
          postStatusId: 3,
          tenantId: 1,
          approvalStatus: "APPROVED",
        }),
      );
      expect(mockMappingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          remoteId: "page-1",
          metadata: { direction: "inbound" },
        }),
      );
      expect(result.synced).toBe(1);
    });

    it("updates existing post on re-sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "page-1",
          title: "Updated Title",
          description: "Updated",
          remoteUrl: "https://notion.so/page-1",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(
        fakeIntegrationMapping({ id: 7, localId: 50, remoteId: "page-1" }),
      );

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.update).toHaveBeenCalledWith(
        50,
        expect.objectContaining({ title: "Updated Title", description: "Updated" }),
      );
      expect(mockPostRepo.create).not.toHaveBeenCalled();
      expect(result.synced).toBe(1);
    });

    it("defaults to first board when no board option matches", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "page-2",
          title: "No Board Match",
          remoteUrl: "https://notion.so/page-2",
          lastEditedTime: new Date().toISOString(),
          // no boardRemoteOptionId
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(null);
      mockPostRepo.create.mockResolvedValue(fakePost({ id: 101 }));

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.create).toHaveBeenCalledWith(expect.objectContaining({ boardId: 10 }));
      expect(result.synced).toBe(1);
    });

    it("skips change when no board mapping exists at all", async () => {
      const noBoardIntegration = fakeIntegration({
        id: 1,
        tenantId: 1,
        config: {
          apiKey: "encrypted:key",
          databaseId: "db-1",
          databaseName: "DB",
          propertyMapping: { title: "Name" },
          statusMapping: {},
          boardMapping: {},
          syncDirection: "inbound",
        },
      });
      mockIntegrationRepo.findById.mockResolvedValue(noBoardIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "page-3",
          title: "Orphan",
          remoteUrl: "https://notion.so/page-3",
          lastEditedTime: new Date().toISOString(),
        },
      ]);

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.create).not.toHaveBeenCalled();
      expect(mockSyncLogRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: "SKIPPED" }));
      expect(result.synced).toBe(0);
      expect(result.errors).toBe(0);
    });

    it("handles per-change exception gracefully", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "page-err",
          title: "Will Fail",
          remoteUrl: "https://notion.so/page-err",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockRejectedValue(new Error("DB crash"));

      const result = await useCase.execute(baseInput);

      expect(result.errors).toBe(1);
      expect(result.synced).toBe(0);
    });
  });

  describe("bidirectional conflict detection", () => {
    const bidiIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      config: {
        apiKey: "encrypted:key",
        databaseId: "db-1",
        databaseName: "DB",
        propertyMapping: { title: "Name" },
        statusMapping: {},
        boardMapping: { "opt-1": { localId: 10, remoteName: "Board" } },
        syncDirection: "bidirectional",
      },
    });

    it("detects inbound conflict when post was modified locally", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(bidiIntegration);
      mockPostRepo.findAllForBoards.mockResolvedValue([]);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 0, likes: 0 });

      const lastSync = new Date("2024-01-01");
      const localUpdate = new Date("2024-06-01"); // after last sync

      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "page-conflict",
          title: "Remote Update",
          remoteUrl: "https://notion.so/page-conflict",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(
        fakeIntegrationMapping({ id: 8, localId: 60, remoteId: "page-conflict", lastSyncAt: lastSync }),
      );
      mockPostRepo.findById.mockResolvedValue(fakePost({ id: 60, updatedAt: localUpdate }));

      const result = await useCase.execute(baseInput);

      expect(mockMappingRepo.update).toHaveBeenCalledWith(8, expect.objectContaining({ syncStatus: "CONFLICT" }));
      expect(mockPostRepo.update).not.toHaveBeenCalled();
      expect(result.synced).toBe(0);
      expect(result.conflicts).toBe(1);
    });
  });

  it("updates lastSyncAt on integration after successful sync", async () => {
    const integration = fakeIntegration({
      id: 1,
      tenantId: 1,
      config: {
        apiKey: "encrypted:key",
        databaseId: "db-1",
        databaseName: "DB",
        propertyMapping: { title: "Name" },
        statusMapping: {},
        boardMapping: {},
        syncDirection: "outbound",
      },
    });
    mockIntegrationRepo.findById.mockResolvedValue(integration);
    mockPostRepo.findAllForBoards.mockResolvedValue([]);

    await useCase.execute(baseInput);

    expect(mockIntegrationRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ lastSyncAt: expect.any(Date) }),
    );
  });
});
