import { ListIntegrationsForTenant } from "@/useCases/ee/integrations/ListIntegrationsForTenant";

import {
  createMockIntegrationRepo,
  fakeIntegration,
  type createMockIntegrationRepo as CreateMockIntegrationRepo,
} from "../helpers";

describe("ListIntegrationsForTenant", () => {
  let mockRepo: ReturnType<typeof CreateMockIntegrationRepo>;
  let useCase: ListIntegrationsForTenant;

  beforeEach(() => {
    mockRepo = createMockIntegrationRepo();
    useCase = new ListIntegrationsForTenant(mockRepo);
  });

  it("returns integrations for the given tenant", async () => {
    const integrations = [fakeIntegration({ id: 1, tenantId: 1 }), fakeIntegration({ id: 2, tenantId: 1 })];
    mockRepo.findAllForTenant.mockResolvedValue(integrations);

    const result = await useCase.execute({ tenantId: 1 });

    expect(mockRepo.findAllForTenant).toHaveBeenCalledWith(1);
    expect(result).toEqual(integrations);
  });

  it("returns empty array when tenant has no integrations", async () => {
    mockRepo.findAllForTenant.mockResolvedValue([]);

    const result = await useCase.execute({ tenantId: 42 });

    expect(result).toEqual([]);
  });
});
