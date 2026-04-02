import { DeleteIntegration } from "@/useCases/ee/integrations/DeleteIntegration";

import {
  createMockIntegrationMappingRepo,
  createMockIntegrationRepo,
  createMockPostRepo,
  fakeIntegration,
  fakePost,
  type createMockIntegrationMappingRepo as CreateMockMappingRepo,
  type createMockIntegrationRepo as CreateMockIntegrationRepo,
  type createMockPostRepo as CreateMockPostRepo,
} from "../helpers";

describe("DeleteIntegration", () => {
  let mockIntegrationRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let mockMappingRepo: ReturnType<typeof CreateMockMappingRepo>;
  let mockPostRepo: ReturnType<typeof CreateMockPostRepo>;
  let useCase: DeleteIntegration;

  beforeEach(() => {
    mockIntegrationRepo = createMockIntegrationRepo();
    mockMappingRepo = createMockIntegrationMappingRepo();
    mockPostRepo = createMockPostRepo();
    useCase = new DeleteIntegration(mockIntegrationRepo, mockMappingRepo, mockPostRepo);
  });

  it("deletes integration without cleanup", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));

    const result = await useCase.execute({ id: 1, tenantId: 1, cleanupInboundPosts: false });

    expect(mockIntegrationRepo.delete).toHaveBeenCalledWith(1);
    expect(mockMappingRepo.findInboundPostIdsForIntegration).not.toHaveBeenCalled();
    expect(result.deletedPostCount).toBe(0);
  });

  it("deletes integration with inbound post cleanup", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    mockMappingRepo.findInboundPostIdsForIntegration.mockResolvedValue([10, 20, 30]);
    mockPostRepo.findById
      .mockResolvedValueOnce(fakePost({ id: 10 }))
      .mockResolvedValueOnce(fakePost({ id: 20 }))
      .mockResolvedValueOnce(fakePost({ id: 30 }));

    const result = await useCase.execute({ id: 1, tenantId: 1, cleanupInboundPosts: true });

    expect(mockMappingRepo.findInboundPostIdsForIntegration).toHaveBeenCalledWith(1);
    expect(mockPostRepo.delete).toHaveBeenCalledTimes(3);
    expect(mockPostRepo.delete).toHaveBeenCalledWith(10);
    expect(mockPostRepo.delete).toHaveBeenCalledWith(20);
    expect(mockPostRepo.delete).toHaveBeenCalledWith(30);
    expect(mockIntegrationRepo.delete).toHaveBeenCalledWith(1);
    expect(result.deletedPostCount).toBe(3);
  });

  it("throws when integration not found", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999, tenantId: 1, cleanupInboundPosts: false })).rejects.toThrow(
      "Integration not found",
    );
  });

  it("throws when tenant mismatch", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 2 }));

    await expect(useCase.execute({ id: 1, tenantId: 1, cleanupInboundPosts: false })).rejects.toThrow(
      "Integration not found",
    );
  });

  it("cleanup with no inbound posts deletes nothing", async () => {
    mockIntegrationRepo.findById.mockResolvedValue(fakeIntegration({ id: 1, tenantId: 1 }));
    mockMappingRepo.findInboundPostIdsForIntegration.mockResolvedValue([]);

    const result = await useCase.execute({ id: 1, tenantId: 1, cleanupInboundPosts: true });

    expect(mockPostRepo.delete).not.toHaveBeenCalled();
    expect(result.deletedPostCount).toBe(0);
  });
});
