import { GetSyncRuns } from "@/useCases/ee/integrations/GetSyncRuns";

import {
  createMockIntegrationRepo,
  createMockSyncLogRepo,
  fakeIntegration,
  type createMockIntegrationRepo as CreateMockIntegrationRepo,
  type createMockSyncLogRepo as CreateMockSyncLogRepo,
} from "../helpers";

describe("GetSyncRuns", () => {
  let mockIntegrationRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let mockSyncLogRepo: ReturnType<typeof CreateMockSyncLogRepo>;
  let useCase: GetSyncRuns;

  beforeEach(() => {
    mockIntegrationRepo = createMockIntegrationRepo();
    mockSyncLogRepo = createMockSyncLogRepo();
    useCase = new GetSyncRuns(mockIntegrationRepo, mockSyncLogRepo);
  });

  it("returns sync runs for a valid integration", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    const fakeSyncRuns = [
      {
        syncRunId: "run-1",
        direction: "OUTBOUND",
        startedAt: new Date("2024-06-01"),
        success: 5,
        errors: 1,
        conflicts: 0,
        skipped: 2,
        total: 8,
        errorDetails: [{ message: "API fail" }],
      },
    ];
    mockSyncLogRepo.findSyncRuns.mockResolvedValue(fakeSyncRuns);

    const result = await useCase.execute({ integrationId: 1, tenantId: 1 });

    expect(mockSyncLogRepo.findSyncRuns).toHaveBeenCalledWith(1, undefined);
    expect(result).toEqual(fakeSyncRuns);
  });

  it("passes limit to repo when provided", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    mockSyncLogRepo.findSyncRuns.mockResolvedValue([]);

    await useCase.execute({ integrationId: 1, tenantId: 1, limit: 5 });

    expect(mockSyncLogRepo.findSyncRuns).toHaveBeenCalledWith(1, 5);
  });

  it("throws when integration not found", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ integrationId: 999, tenantId: 1 })).rejects.toThrow("Integration not found");
  });

  it("throws when tenant mismatch", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 99 }));

    await expect(useCase.execute({ integrationId: 1, tenantId: 1 })).rejects.toThrow("Integration not found");
  });

  it("returns empty array when no sync runs exist", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    mockSyncLogRepo.findSyncRuns.mockResolvedValue([]);

    const result = await useCase.execute({ integrationId: 1, tenantId: 1 });

    expect(result).toEqual([]);
  });

  it("returns multiple sync runs preserving order", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    const runs = [
      {
        syncRunId: "run-3",
        direction: "BIDIRECTIONAL",
        startedAt: new Date("2024-06-03"),
        success: 10,
        errors: 0,
        conflicts: 2,
        skipped: 0,
        total: 12,
        errorDetails: [],
      },
      {
        syncRunId: "run-2",
        direction: "INBOUND",
        startedAt: new Date("2024-06-02"),
        success: 3,
        errors: 0,
        conflicts: 0,
        skipped: 1,
        total: 4,
        errorDetails: [],
      },
    ];
    mockSyncLogRepo.findSyncRuns.mockResolvedValue(runs);

    const result = await useCase.execute({ integrationId: 1, tenantId: 1 });

    expect(result).toHaveLength(2);
    expect(result[0].syncRunId).toBe("run-3");
    expect(result[1].syncRunId).toBe("run-2");
  });
});
