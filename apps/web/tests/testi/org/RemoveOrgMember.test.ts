import { RemoveOrgMember } from "@/useCases/organization/RemoveOrgMember";

import {
  type createMockOrgMemberRepo as CreateMockOrgMemberRepo,
  createMockOrgMemberRepo,
  fakeOrgMember,
} from "../helpers";

const mockTransaction = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

describe("RemoveOrgMember", () => {
  let mockOrgMemberRepo: ReturnType<typeof CreateMockOrgMemberRepo>;
  let useCase: RemoveOrgMember;

  beforeEach(() => {
    mockOrgMemberRepo = createMockOrgMemberRepo();
    useCase = new RemoveOrgMember(mockOrgMemberRepo);
    mockTransaction.mockReset();
  });

  it("removes a non-OWNER member via repo", async () => {
    const member = fakeOrgMember({ id: 1, organizationId: 10, role: "MEMBER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([member]);
    mockOrgMemberRepo.delete.mockResolvedValue({});

    await useCase.execute({ memberId: 1, organizationId: 10 });

    expect(mockOrgMemberRepo.delete).toHaveBeenCalledWith(1);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("uses transaction when removing an OWNER (multiple owners exist)", async () => {
    const owner = fakeOrgMember({ id: 2, organizationId: 10, role: "OWNER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([owner]);

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        orgMember: {
          count: vi.fn().mockResolvedValue(2),
          delete: vi.fn().mockResolvedValue({}),
        },
      };
      await fn(tx);
    });

    await useCase.execute({ memberId: 2, organizationId: 10 });

    expect(mockTransaction).toHaveBeenCalled();
  });

  it("throws when removing the last OWNER", async () => {
    const lastOwner = fakeOrgMember({ id: 3, organizationId: 10, role: "OWNER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([lastOwner]);

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        orgMember: {
          count: vi.fn().mockResolvedValue(1),
          delete: vi.fn(),
        },
      };
      await fn(tx);
    });

    await expect(useCase.execute({ memberId: 3, organizationId: 10 })).rejects.toThrow(
      "Impossible de retirer le dernier propriétaire.",
    );
  });

  it("throws when member is not found", async () => {
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([]);

    await expect(useCase.execute({ memberId: 999, organizationId: 10 })).rejects.toThrow("Membre introuvable.");
  });
});
