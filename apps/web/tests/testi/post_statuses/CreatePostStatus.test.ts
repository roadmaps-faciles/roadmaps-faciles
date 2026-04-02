import { CreatePostStatus } from "@/useCases/post_statuses/CreatePostStatus";

import {
  type createMockPostStatusRepo as CreateMockPostStatusRepo,
  createMockPostStatusRepo,
  fakePostStatus,
} from "../helpers";

describe("CreatePostStatus", () => {
  let mockPostStatusRepo: ReturnType<typeof CreateMockPostStatusRepo>;
  let useCase: CreatePostStatus;

  beforeEach(() => {
    mockPostStatusRepo = createMockPostStatusRepo();
    useCase = new CreatePostStatus(mockPostStatusRepo);
  });

  it("creates a post status with auto-incremented order", async () => {
    mockPostStatusRepo.findAllForTenant.mockResolvedValue([
      fakePostStatus({ order: 0 }),
      fakePostStatus({ order: 1 }),
      fakePostStatus({ order: 2 }),
    ]);
    mockPostStatusRepo.create.mockResolvedValue(fakePostStatus({ order: 3 }));

    await useCase.execute({ tenantId: 1, name: "Done", color: "greenEmeraude", showInRoadmap: true });

    expect(mockPostStatusRepo.create).toHaveBeenCalledWith(expect.objectContaining({ order: 3 }));
  });

  it("creates first status with order 0", async () => {
    mockPostStatusRepo.findAllForTenant.mockResolvedValue([]);
    mockPostStatusRepo.create.mockResolvedValue(fakePostStatus({ order: 0 }));

    await useCase.execute({ tenantId: 1, name: "New", color: "blueFrance", showInRoadmap: true });

    expect(mockPostStatusRepo.create).toHaveBeenCalledWith(expect.objectContaining({ order: 0 }));
  });

  it("passes all fields to repo", async () => {
    mockPostStatusRepo.findAllForTenant.mockResolvedValue([]);
    mockPostStatusRepo.create.mockResolvedValue(fakePostStatus());

    await useCase.execute({ tenantId: 1, name: "In Progress", color: "orangeTerreBattue", showInRoadmap: false });

    expect(mockPostStatusRepo.create).toHaveBeenCalledWith({
      tenantId: 1,
      name: "In Progress",
      color: "orangeTerreBattue",
      showInRoadmap: false,
      order: 0,
    });
  });
});
