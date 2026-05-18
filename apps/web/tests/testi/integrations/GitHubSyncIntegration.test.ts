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

vi.mock("@/lib/ee/integration-provider/encryption", () => ({
  encrypt: vi.fn((val: string) => `encrypted:${val}`),
  decrypt: vi.fn((val: string) => val.replace("encrypted:", "")),
}));

const mockSyncOutbound = vi.fn();
const mockSyncInbound = vi.fn();
const mockUpdateCommentsField = vi.fn();
const mockUpdateLikesField = vi.fn();
const mockUpdateRemoteStats = vi.fn();
let exposeUpdateRemoteStats = false;
vi.mock("@/lib/ee/integration-provider", () => ({
  createIntegrationProvider: () => ({
    syncOutbound: mockSyncOutbound,
    syncInbound: mockSyncInbound,
    updateCommentsField: mockUpdateCommentsField,
    updateLikesField: mockUpdateLikesField,
    ...(exposeUpdateRemoteStats ? { updateRemoteStats: mockUpdateRemoteStats } : {}),
  }),
}));

const githubConfig = {
  apiKey: "encrypted:ghp_test",
  authType: "pat" as const,
  sourceType: "issues" as const,
  databaseId: "owner/repo",
  databaseName: "owner/repo",
  propertyMapping: { title: "title" },
  statusMapping: { "status-opt-1": { localId: 3, remoteName: "En cours" } },
  boardMapping: { "board-opt-1": { localId: 10, remoteName: "Board" } },
  syncDirection: "bidirectional" as const,
};

describe("SyncIntegration - GitHub provider", () => {
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
    mockUpdateRemoteStats.mockReset().mockResolvedValue(undefined);
    exposeUpdateRemoteStats = false;
    mockMappingRepo.create.mockResolvedValue(fakeIntegrationMapping({ id: 999 }));
  });

  describe("inbound sync", () => {
    const inboundIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      type: "GITHUB",
      config: { ...githubConfig, syncDirection: "inbound" },
    });

    it("creates posts from GitHub issues", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "issue-42",
          title: "Bug: login broken",
          description: "Steps to reproduce...",
          remoteUrl: "https://github.com/owner/repo/issues/42",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
          statusRemoteOptionId: "status-opt-1",
          tags: ["bug", "auth"],
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(null);
      mockPostRepo.create.mockResolvedValue(fakePost({ id: 200 }));

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Bug: login broken",
          description: "Steps to reproduce...",
          boardId: 10,
          postStatusId: 3,
          tenantId: 1,
          tags: ["bug", "auth"],
          approvalStatus: "APPROVED",
        }),
      );
      expect(mockMappingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          remoteId: "issue-42",
          remoteUrl: "https://github.com/owner/repo/issues/42",
          metadata: expect.objectContaining({ direction: "inbound" }),
        }),
      );
      expect(result.synced).toBe(1);
      expect(result.errors).toBe(0);
    });

    it("updates existing post on re-sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "issue-42",
          title: "Bug: login broken (updated)",
          description: "New repro steps",
          remoteUrl: "https://github.com/owner/repo/issues/42",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(
        fakeIntegrationMapping({ id: 12, localId: 200, remoteId: "issue-42" }),
      );

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.update).toHaveBeenCalledWith(
        200,
        expect.objectContaining({ title: "Bug: login broken (updated)", description: "New repro steps" }),
      );
      expect(mockPostRepo.create).not.toHaveBeenCalled();
      expect(result.synced).toBe(1);
    });
  });

  describe("outbound sync", () => {
    const outboundIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      type: "GITHUB",
      config: { ...githubConfig, syncDirection: "outbound" },
    });

    it("syncs posts outbound to GitHub", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 50, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockMappingRepo.findByLocalEntity.mockResolvedValue(null);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 3, likes: 7 });
      mockSyncOutbound.mockResolvedValue({
        success: true,
        remoteId: "issue-99",
        remoteUrl: "https://github.com/owner/repo/issues/99",
      });

      const result = await useCase.execute(baseInput);

      expect(mockSyncOutbound).toHaveBeenCalledTimes(1);
      expect(mockMappingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          integrationId: 1,
          localType: "post",
          localId: 50,
          remoteId: "issue-99",
          metadata: { direction: "outbound" },
        }),
      );
      expect(result.synced).toBe(1);
      expect(result.errors).toBe(0);
    });

    it("updates existing mapping on re-sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 50, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      const existing = fakeIntegrationMapping({ id: 15, integrationId: 1, localId: 50, remoteId: "issue-99" });
      mockMappingRepo.findByLocalEntity.mockResolvedValue(existing);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 0, likes: 0 });
      mockSyncOutbound.mockResolvedValue({
        success: true,
        remoteId: "issue-99",
        remoteUrl: "https://github.com/owner/repo/issues/99",
      });

      const result = await useCase.execute(baseInput);

      expect(mockMappingRepo.update).toHaveBeenCalledWith(
        15,
        expect.objectContaining({ syncStatus: "SYNCED", lastError: null }),
      );
      expect(mockMappingRepo.create).not.toHaveBeenCalled();
      expect(result.synced).toBe(1);
    });
  });

  describe("PR filtering", () => {
    it("does not import PRs when provider excludes them", async () => {
      const noPrIntegration = fakeIntegration({
        id: 1,
        tenantId: 1,
        type: "GITHUB",
        config: { ...githubConfig, syncDirection: "inbound", includePullRequests: false },
      });
      mockIntegrationRepo.findById.mockResolvedValue(noPrIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "issue-10",
          title: "Real issue",
          remoteUrl: "https://github.com/owner/repo/issues/10",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(null);
      mockPostRepo.create.mockResolvedValue(fakePost({ id: 300 }));

      const result = await useCase.execute(baseInput);

      expect(mockPostRepo.create).toHaveBeenCalledTimes(1);
      expect(mockPostRepo.create).toHaveBeenCalledWith(expect.objectContaining({ title: "Real issue" }));
      expect(result.synced).toBe(1);
    });
  });

  describe("bidirectional conflict detection", () => {
    const bidiIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      type: "GITHUB",
      config: githubConfig,
    });

    it("detects conflict when post was modified locally after last sync", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(bidiIntegration);
      mockPostRepo.findAllForBoards.mockResolvedValue([]);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 0, likes: 0 });

      const lastSync = new Date("2024-01-01");
      const localUpdate = new Date("2024-06-01");

      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "issue-77",
          title: "Remote change",
          remoteUrl: "https://github.com/owner/repo/issues/77",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(
        fakeIntegrationMapping({ id: 20, localId: 80, remoteId: "issue-77", lastSyncAt: lastSync }),
      );
      mockPostRepo.findById.mockResolvedValue(fakePost({ id: 80, updatedAt: localUpdate }));

      const result = await useCase.execute(baseInput);

      expect(mockMappingRepo.update).toHaveBeenCalledWith(20, expect.objectContaining({ syncStatus: "CONFLICT" }));
      expect(mockPostRepo.update).not.toHaveBeenCalled();
      expect(result.synced).toBe(0);
      expect(result.conflicts).toBe(1);
    });

    it("syncs without conflict when post was not modified locally", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(bidiIntegration);
      mockPostRepo.findAllForBoards.mockResolvedValue([]);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 0, likes: 0 });

      const lastSync = new Date("2024-06-01");
      const localUpdate = new Date("2024-01-01");

      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "issue-78",
          title: "Remote only change",
          remoteUrl: "https://github.com/owner/repo/issues/78",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(
        fakeIntegrationMapping({ id: 21, localId: 81, remoteId: "issue-78", lastSyncAt: lastSync }),
      );
      mockPostRepo.findById.mockResolvedValue(fakePost({ id: 81, updatedAt: localUpdate }));

      const result = await useCase.execute(baseInput);

      expect(mockMappingRepo.update).toHaveBeenCalledWith(21, expect.objectContaining({ syncStatus: "SYNCED" }));
      expect(result.synced).toBe(1);
      expect(result.conflicts).toBe(0);
    });
  });

  describe("remote stats", () => {
    const inboundIntegration = fakeIntegration({
      id: 1,
      tenantId: 1,
      type: "GITHUB",
      config: { ...githubConfig, syncDirection: "inbound" },
    });

    it("persists remoteStats from InboundChange into mapping metadata", async () => {
      mockIntegrationRepo.findById.mockResolvedValue(inboundIntegration);
      mockSyncInbound.mockResolvedValue([
        {
          remoteId: "issue-42",
          title: "Bug",
          remoteUrl: "https://github.com/owner/repo/issues/42",
          lastEditedTime: new Date().toISOString(),
          boardRemoteOptionId: "board-opt-1",
          remoteStats: { commentCount: 5, reactionCount: 12 },
        },
      ]);
      mockMappingRepo.findByRemoteId.mockResolvedValue(null);
      mockPostRepo.create.mockResolvedValue(fakePost({ id: 300 }));

      await useCase.execute(baseInput);

      expect(mockMappingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            direction: "inbound",
            remoteStats: { commentCount: 5, reactionCount: 12 },
          }),
        }),
      );
    });

    it("prefers updateRemoteStats over separate field updates when available", async () => {
      exposeUpdateRemoteStats = true;
      mockUpdateRemoteStats.mockResolvedValue({ statsCommentId: 999 });
      const outboundIntegration = fakeIntegration({
        id: 1,
        tenantId: 1,
        type: "GITHUB",
        config: { ...githubConfig, syncDirection: "outbound" },
      });
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 50, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockMappingRepo.findByLocalEntity.mockResolvedValue(null);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 4, likes: 8 });
      mockMappingRepo.create.mockResolvedValue(fakeIntegrationMapping({ id: 77, integrationId: 1, localId: 50 }));
      mockSyncOutbound.mockResolvedValue({
        success: true,
        remoteId: "issue-100",
        remoteUrl: "https://github.com/owner/repo/issues/100",
      });

      await useCase.execute(baseInput);

      expect(mockUpdateRemoteStats).toHaveBeenCalledWith(
        "issue-100",
        expect.objectContaining({ commentCount: 4, likeCount: 8 }),
        undefined,
      );
      expect(mockUpdateCommentsField).not.toHaveBeenCalled();
      expect(mockUpdateLikesField).not.toHaveBeenCalled();
      expect(mockMappingRepo.update).toHaveBeenCalledWith(
        77,
        expect.objectContaining({ metadata: expect.objectContaining({ statsCommentId: 999 }) }),
      );
    });

    it("falls back to separate updateCommentsField + updateLikesField when updateRemoteStats unavailable", async () => {
      exposeUpdateRemoteStats = false;
      const outboundIntegration = fakeIntegration({
        id: 1,
        tenantId: 1,
        type: "GITHUB",
        config: { ...githubConfig, syncDirection: "outbound" },
      });
      mockIntegrationRepo.findById.mockResolvedValue(outboundIntegration);
      const post = fakePost({ id: 50, boardId: 10, tenantId: 1 });
      mockPostRepo.findAllForBoards.mockResolvedValue([post]);
      mockMappingRepo.findByLocalEntity.mockResolvedValue(null);
      mockPostRepo.getPostCounts.mockResolvedValue({ comments: 2, likes: 6 });
      mockSyncOutbound.mockResolvedValue({
        success: true,
        remoteId: "issue-101",
        remoteUrl: "https://github.com/owner/repo/issues/101",
      });

      await useCase.execute(baseInput);

      expect(mockUpdateCommentsField).toHaveBeenCalledWith("issue-101", 2, expect.any(String), expect.any(String));
      expect(mockUpdateLikesField).toHaveBeenCalledWith("issue-101", 6);
      expect(mockUpdateRemoteStats).not.toHaveBeenCalled();
    });
  });
});
