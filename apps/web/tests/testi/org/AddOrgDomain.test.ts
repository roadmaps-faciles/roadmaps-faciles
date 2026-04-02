import { AddOrgDomain } from "@/useCases/ee/organization/AddOrgDomain";

import { type createMockOrgDomainRepo as CreateMockOrgDomainRepo, createMockOrgDomainRepo } from "../helpers";

// Mock domain-verification to control token generation
vi.mock("@/lib/ee/domain-verification", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/ee/domain-verification")>();
  return {
    ...original,
    generateVerificationToken: () => "roadmaps-faciles-verify=mock-token",
  };
});

describe("AddOrgDomain", () => {
  let mockOrgDomainRepo: ReturnType<typeof CreateMockOrgDomainRepo>;
  let useCase: AddOrgDomain;

  beforeEach(() => {
    mockOrgDomainRepo = createMockOrgDomainRepo();
    useCase = new AddOrgDomain(mockOrgDomainRepo);
  });

  it("creates a new domain with verification token", async () => {
    const created = {
      id: 1,
      organizationId: 10,
      domain: "example.com",
      verificationToken: "roadmaps-faciles-verify=mock-token",
      verifiedAt: null,
      isGouv: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrgDomainRepo.findByDomain.mockResolvedValue(null);
    mockOrgDomainRepo.create.mockResolvedValue(created);

    const result = await useCase.execute({ organizationId: 10, domain: "example.com" });

    expect(mockOrgDomainRepo.create).toHaveBeenCalledWith({
      organizationId: 10,
      domain: "example.com",
      verificationToken: "roadmaps-faciles-verify=mock-token",
      isGouv: false,
    });
    expect(result).toEqual(created);
  });

  it("detects .gouv.fr domains automatically", async () => {
    mockOrgDomainRepo.findByDomain.mockResolvedValue(null);
    mockOrgDomainRepo.create.mockResolvedValue({});

    await useCase.execute({ organizationId: 10, domain: "ademe.gouv.fr" });

    expect(mockOrgDomainRepo.create).toHaveBeenCalledWith(expect.objectContaining({ isGouv: true }));
  });

  it("throws when domain is already registered", async () => {
    mockOrgDomainRepo.findByDomain.mockResolvedValue({ id: 1 });

    await expect(useCase.execute({ organizationId: 10, domain: "taken.com" })).rejects.toThrow(
      "Ce domaine est déjà enregistré.",
    );

    expect(mockOrgDomainRepo.create).not.toHaveBeenCalled();
  });
});
