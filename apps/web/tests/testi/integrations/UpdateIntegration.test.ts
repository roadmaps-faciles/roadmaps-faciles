import { UpdateIntegration } from "@/useCases/ee/integrations/UpdateIntegration";

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

describe("UpdateIntegration", () => {
  let mockRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let useCase: UpdateIntegration;

  const existing = fakeIntegration({
    id: 1,
    tenantId: 1,
    name: "Old Name",
    enabled: true,
    config: {
      apiKey: "encrypted:old-key",
      databaseId: "db-1",
      databaseName: "DB",
      propertyMapping: { title: "Name" },
      statusMapping: {},
      boardMapping: {},
      syncDirection: "outbound",
    },
  });

  beforeEach(() => {
    mockRepo = createMockIntegrationRepo();
    useCase = new UpdateIntegration(mockRepo);
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockImplementation((_id, data) => Promise.resolve({ ...existing, ...data }));
  });

  it("throws when integration not found", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999, tenantId: 1 })).rejects.toThrow("Integration not found");
  });

  it("throws when tenant mismatch", async () => {
    await expect(useCase.execute({ id: 1, tenantId: 99 })).rejects.toThrow("Integration not found");
  });

  it("updates name only", async () => {
    await useCase.execute({ id: 1, tenantId: 1, name: "New Name" });

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: "New Name" }));
    // Should not include config
    const callData = mockRepo.update.mock.calls[0][1] as Record<string, unknown>;
    expect(callData.config).toBeUndefined();
  });

  it("updates enabled flag", async () => {
    await useCase.execute({ id: 1, tenantId: 1, enabled: false });

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ enabled: false }));
  });

  it("updates syncIntervalMinutes", async () => {
    await useCase.execute({ id: 1, tenantId: 1, syncIntervalMinutes: 30 });

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ syncIntervalMinutes: 30 }));
  });

  it("merges config and re-encrypts new API key", async () => {
    await useCase.execute({
      id: 1,
      tenantId: 1,
      config: { apiKey: "new-plain-key", databaseName: "Updated DB" },
    });

    const callData = mockRepo.update.mock.calls[0][1] as Record<string, unknown>;
    const updatedConfig = callData.config as Record<string, unknown>;
    expect(updatedConfig.apiKey).toBe("encrypted:new-plain-key");
    expect(updatedConfig.databaseName).toBe("Updated DB");
    // Original fields preserved
    expect(updatedConfig.databaseId).toBe("db-1");
    expect(updatedConfig.syncDirection).toBe("outbound");
  });

  it("does not re-encrypt already-encrypted API key", async () => {
    // Key with ":" separator is treated as already encrypted
    await useCase.execute({
      id: 1,
      tenantId: 1,
      config: { apiKey: "salt:iv:tag:cipher" },
    });

    const callData = mockRepo.update.mock.calls[0][1] as Record<string, unknown>;
    const updatedConfig = callData.config as Record<string, unknown>;
    expect(updatedConfig.apiKey).toBe("salt:iv:tag:cipher");
  });

  it("updates config without API key change", async () => {
    await useCase.execute({
      id: 1,
      tenantId: 1,
      config: { databaseName: "New DB Name" },
    });

    const callData = mockRepo.update.mock.calls[0][1] as Record<string, unknown>;
    const updatedConfig = callData.config as Record<string, unknown>;
    // Original API key preserved
    expect(updatedConfig.apiKey).toBe("encrypted:old-key");
  });
});
