import { VerifyOrgDomain } from "@/useCases/ee/organization/VerifyOrgDomain";

import {
  type createMockOrgDomainRepo as CreateMockOrgDomainRepo,
  type createMockOrganizationRepo as CreateMockOrganizationRepo,
  createMockOrgDomainRepo,
  createMockOrganizationRepo,
  fakeOrganization,
} from "../helpers";

const mockVerifyDomainTxt = vi.fn();
vi.mock("@/lib/ee/domain-verification", () => ({
  verifyDomainTxt: (...args: unknown[]) => mockVerifyDomainTxt(...args),
}));

describe("VerifyOrgDomain", () => {
  let mockOrgDomainRepo: ReturnType<typeof CreateMockOrgDomainRepo>;
  let mockOrganizationRepo: ReturnType<typeof CreateMockOrganizationRepo>;
  let useCase: VerifyOrgDomain;

  beforeEach(() => {
    mockOrgDomainRepo = createMockOrgDomainRepo();
    mockOrganizationRepo = createMockOrganizationRepo();
    useCase = new VerifyOrgDomain(mockOrgDomainRepo, mockOrganizationRepo);
    mockVerifyDomainTxt.mockReset();
  });

  it("verifies domain when TXT record matches", async () => {
    const orgDomain = {
      id: 1,
      organizationId: 10,
      domain: "example.com",
      verificationToken: "roadmaps-faciles-verify=abc123",
      verifiedAt: null,
      isGouv: false,
    };
    const verifiedDomain = { ...orgDomain, verifiedAt: new Date() };

    mockOrgDomainRepo.findById.mockResolvedValue(orgDomain);
    mockVerifyDomainTxt.mockResolvedValue(true);
    mockOrgDomainRepo.verify.mockResolvedValue(verifiedDomain);

    const result = await useCase.execute({ orgDomainId: 1 });

    expect(result.verified).toBe(true);
    expect(result.planUpgraded).toBe(false);
    expect(mockOrgDomainRepo.verify).toHaveBeenCalledWith(1);
  });

  it("returns verified=false when TXT record not found", async () => {
    const orgDomain = {
      id: 2,
      organizationId: 10,
      domain: "example.com",
      verificationToken: "roadmaps-faciles-verify=xyz",
      verifiedAt: null,
      isGouv: false,
    };

    mockOrgDomainRepo.findById.mockResolvedValue(orgDomain);
    mockVerifyDomainTxt.mockResolvedValue(false);

    const result = await useCase.execute({ orgDomainId: 2 });

    expect(result.verified).toBe(false);
    expect(mockOrgDomainRepo.verify).not.toHaveBeenCalled();
  });

  it("auto-upgrades org to GOV when .gouv.fr domain is verified", async () => {
    const orgDomain = {
      id: 3,
      organizationId: 10,
      domain: "ademe.gouv.fr",
      verificationToken: "roadmaps-faciles-verify=gouv",
      verifiedAt: null,
      isGouv: true,
    };
    const org = fakeOrganization({ id: 10, plan: "FREE" });

    mockOrgDomainRepo.findById.mockResolvedValue(orgDomain);
    mockVerifyDomainTxt.mockResolvedValue(true);
    mockOrgDomainRepo.verify.mockResolvedValue({ ...orgDomain, verifiedAt: new Date() });
    mockOrganizationRepo.findById.mockResolvedValue(org);
    mockOrganizationRepo.update.mockResolvedValue({});

    const result = await useCase.execute({ orgDomainId: 3 });

    expect(result.verified).toBe(true);
    expect(result.planUpgraded).toBe(true);
    expect(mockOrganizationRepo.update).toHaveBeenCalledWith(10, { plan: "GOV" });
  });

  it("does not upgrade if org already has GOV plan", async () => {
    const orgDomain = {
      id: 4,
      organizationId: 10,
      domain: "already.gouv.fr",
      verificationToken: "roadmaps-faciles-verify=gov2",
      verifiedAt: null,
      isGouv: true,
    };
    const org = fakeOrganization({ id: 10, plan: "GOV" });

    mockOrgDomainRepo.findById.mockResolvedValue(orgDomain);
    mockVerifyDomainTxt.mockResolvedValue(true);
    mockOrgDomainRepo.verify.mockResolvedValue({ ...orgDomain, verifiedAt: new Date() });
    mockOrganizationRepo.findById.mockResolvedValue(org);

    const result = await useCase.execute({ orgDomainId: 4 });

    expect(result.planUpgraded).toBe(false);
    expect(mockOrganizationRepo.update).not.toHaveBeenCalled();
  });

  it("throws when domain is not found", async () => {
    mockOrgDomainRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ orgDomainId: 999 })).rejects.toThrow("Domaine introuvable.");
  });
});
