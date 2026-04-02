import { CreateIntegration } from "@/useCases/ee/integrations/CreateIntegration";

import {
  createMockIntegrationRepo,
  fakeIntegration,
  type createMockIntegrationRepo as CreateMockIntegrationRepo,
} from "../helpers";

// Mock encryption
vi.mock("@/lib/ee/integration-provider/encryption", () => ({
  encrypt: vi.fn((val: string) => `encrypted:${val}`),
  decrypt: vi.fn((val: string) => val.replace("encrypted:", "")),
}));

// Mock provider
const mockTestConnection = vi.fn();
const mockSyncOutbound = vi.fn();
vi.mock("@/lib/ee/integration-provider", () => ({
  createIntegrationProvider: () => ({
    testConnection: mockTestConnection,
    syncOutbound: mockSyncOutbound,
  }),
}));

describe("CreateIntegration", () => {
  let mockRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let useCase: CreateIntegration;

  beforeEach(() => {
    mockRepo = createMockIntegrationRepo();
    useCase = new CreateIntegration(mockRepo);
    mockTestConnection.mockReset();
  });

  it("creates integration with encrypted API key on successful connection test", async () => {
    mockTestConnection.mockResolvedValue({ success: true, botName: "Test Bot" });
    const created = fakeIntegration();
    mockRepo.create.mockResolvedValue(created);

    const result = await useCase.execute({
      tenantId: 1,
      type: "NOTION",
      name: "My Notion",
      config: {
        apiKey: "ntn_secret",
        databaseId: "db-1",
        databaseName: "DB",
        propertyMapping: { title: "Name" },
        statusMapping: {},
        boardMapping: {},
        syncDirection: "outbound",
      },
    });

    expect(mockTestConnection).toHaveBeenCalledTimes(1);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 1,
        type: "NOTION",
        name: "My Notion",
      }),
    );
    // API key should be encrypted
    const callArgs = mockRepo.create.mock.calls[0][0] as { config: { apiKey: string } };
    expect(callArgs.config.apiKey).toBe("encrypted:ntn_secret");
    expect(result).toBe(created);
  });

  it("throws when connection test fails", async () => {
    mockTestConnection.mockResolvedValue({ success: false, error: "Invalid token" });

    await expect(
      useCase.execute({
        tenantId: 1,
        type: "NOTION",
        name: "Bad",
        config: {
          apiKey: "bad-key",
          databaseId: "",
          databaseName: "",
          propertyMapping: { title: "" },
          statusMapping: {},
          boardMapping: {},
          syncDirection: "outbound",
        },
      }),
    ).rejects.toThrow("Connection test failed: Invalid token");

    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
