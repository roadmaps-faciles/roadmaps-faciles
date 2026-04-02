import { ResolveSyncConflict } from "@/useCases/ee/integrations/ResolveSyncConflict";

import {
  createMockIntegrationMappingRepo,
  createMockIntegrationRepo,
  createMockPostRepo,
  createMockSyncLogRepo,
  fakeIntegration,
  fakeIntegrationMapping,
  fakePost,
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
const mockGetInboundChange = vi.fn();
vi.mock("@/lib/ee/integration-provider", () => ({
  createIntegrationProvider: () => ({
    syncOutbound: mockSyncOutbound,
    getInboundChange: mockGetInboundChange,
  }),
}));

describe("ResolveSyncConflict", () => {
  let mockIntegrationRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let mockMappingRepo: ReturnType<typeof CreateMockMappingRepo>;
  let mockSyncLogRepo: ReturnType<typeof CreateMockSyncLogRepo>;
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: ResolveSyncConflict;

  const integration = fakeIntegration({
    id: 1,
    tenantId: 1,
    config: {
      apiKey: "encrypted:key",
      databaseId: "db-1",
      databaseName: "DB",
      propertyMapping: { title: "Name" },
      statusMapping: { "status-opt": { localId: 5, notionName: "Done" } },
      boardMapping: {},
      syncDirection: "bidirectional",
    },
  });

  const mapping = fakeIntegrationMapping({
    id: 10,
    integrationId: 1,
    localId: 42,
    remoteId: "remote-page-1",
    syncStatus: "CONFLICT",
  });

  beforeEach(() => {
    mockIntegrationRepo = createMockIntegrationRepo();
    mockMappingRepo = createMockIntegrationMappingRepo();
    mockSyncLogRepo = createMockSyncLogRepo();
    mockPostRepo = createMockPostRepo();
    useCase = new ResolveSyncConflict(mockIntegrationRepo, mockMappingRepo, mockSyncLogRepo, mockPostRepo);
    mockSyncOutbound.mockReset();
    mockGetInboundChange.mockReset();
  });

  it("throws when mapping not found", async () => {
    mockMappingRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ mappingId: 999, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" }),
    ).rejects.toThrow("Mapping not found");
  });

  it("throws when integration not found for mapping", async () => {
    mockMappingRepo.findById.mockResolvedValue(mapping);
    mockIntegrationRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ mappingId: 10, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" }),
    ).rejects.toThrow("Integration not found");
  });

  it("throws when tenant mismatch on integration", async () => {
    mockMappingRepo.findById.mockResolvedValue(mapping);
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 99 }));

    await expect(
      useCase.execute({ mappingId: 10, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" }),
    ).rejects.toThrow("Integration not found");
  });

  describe("resolution: local", () => {
    it("pushes local post to Notion and marks resolved", async () => {
      mockMappingRepo.findById.mockResolvedValue(mapping);
      mockIntegrationRepo.findById.mockResolvedValue(integration);
      const post = fakePost({ id: 42, tenantId: 1, title: "Local Version", description: "My desc" });
      mockPostRepo.findById.mockResolvedValue(post);
      mockSyncOutbound.mockResolvedValue({ success: true, remoteId: "remote-page-1" });

      await useCase.execute({ mappingId: 10, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" });

      expect(mockSyncOutbound).toHaveBeenCalledWith(
        expect.objectContaining({ postId: 42, title: "Local Version" }),
        "remote-page-1",
      );
      expect(mockMappingRepo.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ syncStatus: "SYNCED", lastError: null }),
      );
      expect(mockSyncLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ direction: "OUTBOUND", status: "SUCCESS" }),
      );
    });

    it("throws when local post not found", async () => {
      mockMappingRepo.findById.mockResolvedValue(mapping);
      mockIntegrationRepo.findById.mockResolvedValue(integration);
      mockPostRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ mappingId: 10, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" }),
      ).rejects.toThrow("Local post not found");
    });

    it("throws when post belongs to different tenant", async () => {
      mockMappingRepo.findById.mockResolvedValue(mapping);
      mockIntegrationRepo.findById.mockResolvedValue(integration);
      mockPostRepo.findById.mockResolvedValue(fakePost({ id: 42, tenantId: 99 }));

      await expect(
        useCase.execute({ mappingId: 10, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" }),
      ).rejects.toThrow("Post does not belong to caller's tenant");
    });

    it("throws when outbound push fails", async () => {
      mockMappingRepo.findById.mockResolvedValue(mapping);
      mockIntegrationRepo.findById.mockResolvedValue(integration);
      mockPostRepo.findById.mockResolvedValue(fakePost({ id: 42, tenantId: 1 }));
      mockSyncOutbound.mockResolvedValue({ success: false, remoteId: "", error: "API fail" });

      await expect(
        useCase.execute({ mappingId: 10, resolution: "local", tenantId: 1, tenantUrl: "https://test.com" }),
      ).rejects.toThrow("Failed to push local version: API fail");
    });
  });

  describe("resolution: remote", () => {
    it("pulls Notion version and updates local post", async () => {
      mockMappingRepo.findById.mockResolvedValue(mapping);
      mockIntegrationRepo.findById.mockResolvedValue(integration);
      mockGetInboundChange.mockResolvedValue({
        remoteId: "remote-page-1",
        title: "Notion Version",
        description: "From Notion",
        remoteUrl: "https://notion.so/page",
        lastEditedTime: new Date().toISOString(),
        statusNotionOptionId: "status-opt",
        tags: ["notion-tag"],
      });

      await useCase.execute({ mappingId: 10, resolution: "remote", tenantId: 1, tenantUrl: "https://test.com" });

      expect(mockGetInboundChange).toHaveBeenCalledWith("remote-page-1");
      expect(mockPostRepo.update).toHaveBeenCalledWith(42, {
        title: "Notion Version",
        description: "From Notion",
        postStatusId: 5,
        tags: ["notion-tag"],
      });
      expect(mockMappingRepo.update).toHaveBeenCalledWith(10, expect.objectContaining({ syncStatus: "SYNCED" }));
      expect(mockSyncLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ direction: "INBOUND", status: "SUCCESS" }),
      );
    });

    it("throws when remote page not found", async () => {
      mockMappingRepo.findById.mockResolvedValue(mapping);
      mockIntegrationRepo.findById.mockResolvedValue(integration);
      mockGetInboundChange.mockResolvedValue(null);

      await expect(
        useCase.execute({ mappingId: 10, resolution: "remote", tenantId: 1, tenantUrl: "https://test.com" }),
      ).rejects.toThrow("Remote page not found in Notion");
    });
  });
});
