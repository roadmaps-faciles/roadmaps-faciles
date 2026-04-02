import { GetIntegrationSyncLogs } from "@/useCases/ee/integrations/GetIntegrationSyncLogs";

import {
  createMockIntegrationRepo,
  createMockSyncLogRepo,
  fakeIntegration,
  fakeSyncLog,
  type createMockIntegrationRepo as CreateMockIntegrationRepo,
  type createMockSyncLogRepo as CreateMockSyncLogRepo,
} from "../helpers";

describe("GetIntegrationSyncLogs", () => {
  let mockIntegrationRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let mockSyncLogRepo: ReturnType<typeof CreateMockSyncLogRepo>;
  let useCase: GetIntegrationSyncLogs;

  beforeEach(() => {
    mockIntegrationRepo = createMockIntegrationRepo();
    mockSyncLogRepo = createMockSyncLogRepo();
    useCase = new GetIntegrationSyncLogs(mockIntegrationRepo, mockSyncLogRepo);
  });

  it("throws when integration not found", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ integrationId: 999, tenantId: 1 })).rejects.toThrow("Integration not found");
  });

  it("throws when tenant mismatch", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 99 }));

    await expect(useCase.execute({ integrationId: 1, tenantId: 1 })).rejects.toThrow("Integration not found");
  });

  it("returns recent logs with default limit", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    const logs = [fakeSyncLog({ id: 1 }), fakeSyncLog({ id: 2 })];
    mockSyncLogRepo.findRecentForIntegration.mockResolvedValue(logs);

    const result = await useCase.execute({ integrationId: 1, tenantId: 1 });

    expect(mockSyncLogRepo.findRecentForIntegration).toHaveBeenCalledWith(1, undefined);
    expect(result).toEqual(logs);
  });

  it("passes custom limit to repo", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    mockSyncLogRepo.findRecentForIntegration.mockResolvedValue([]);

    await useCase.execute({ integrationId: 1, tenantId: 1, limit: 5 });

    expect(mockSyncLogRepo.findRecentForIntegration).toHaveBeenCalledWith(1, 5);
  });

  it("returns empty array when no logs exist", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    mockSyncLogRepo.findRecentForIntegration.mockResolvedValue([]);

    const result = await useCase.execute({ integrationId: 1, tenantId: 1 });

    expect(result).toEqual([]);
  });
});
