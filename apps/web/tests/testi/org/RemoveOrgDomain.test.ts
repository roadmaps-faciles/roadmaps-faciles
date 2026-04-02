import { RemoveOrgDomain } from "@/useCases/ee/organization/RemoveOrgDomain";

import { type createMockOrgDomainRepo as CreateMockOrgDomainRepo, createMockOrgDomainRepo } from "../helpers";

describe("RemoveOrgDomain", () => {
  let mockOrgDomainRepo: ReturnType<typeof CreateMockOrgDomainRepo>;
  let useCase: RemoveOrgDomain;

  beforeEach(() => {
    mockOrgDomainRepo = createMockOrgDomainRepo();
    useCase = new RemoveOrgDomain(mockOrgDomainRepo);
  });

  it("deletes a domain belonging to the organization", async () => {
    const domain = {
      id: 1,
      organizationId: 10,
      domain: "example.com",
      verificationToken: "token",
      verifiedAt: null,
      isGouv: false,
    };

    mockOrgDomainRepo.findById.mockResolvedValue(domain);
    mockOrgDomainRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ orgDomainId: 1, organizationId: 10 });

    expect(mockOrgDomainRepo.delete).toHaveBeenCalledWith(1);
  });

  it("throws when domain does not belong to the organization", async () => {
    const domain = {
      id: 2,
      organizationId: 99, // Different org
      domain: "other.com",
      verificationToken: "token",
      verifiedAt: null,
      isGouv: false,
    };

    mockOrgDomainRepo.findById.mockResolvedValue(domain);

    await expect(useCase.execute({ orgDomainId: 2, organizationId: 10 })).rejects.toThrow(
      "Ce domaine n'appartient pas à cette organisation.",
    );

    expect(mockOrgDomainRepo.delete).not.toHaveBeenCalled();
  });

  it("throws when domain is not found", async () => {
    mockOrgDomainRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ orgDomainId: 999, organizationId: 10 })).rejects.toThrow("Domaine introuvable.");
  });
});
