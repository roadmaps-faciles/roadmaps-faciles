import { UpdateOrgMemberRole } from "@/useCases/organization/UpdateOrgMemberRole";

import {
  type createMockOrgMemberRepo as CreateMockOrgMemberRepo,
  createMockOrgMemberRepo,
  fakeOrgMember,
} from "../helpers";

// Mock prisma pour les transactions TOCTOU
const mockTransaction = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

describe("UpdateOrgMemberRole", () => {
  let mockOrgMemberRepo: ReturnType<typeof CreateMockOrgMemberRepo>;
  let useCase: UpdateOrgMemberRole;

  beforeEach(() => {
    mockOrgMemberRepo = createMockOrgMemberRepo();
    useCase = new UpdateOrgMemberRole(mockOrgMemberRepo);
    mockTransaction.mockReset();
  });

  it("updates role for a non-OWNER member via repo", async () => {
    const member = fakeOrgMember({ id: 1, organizationId: 10, role: "MEMBER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([member]);
    mockOrgMemberRepo.update.mockResolvedValue({});

    await useCase.execute({ memberId: 1, organizationId: 10, role: "ADMIN" });

    expect(mockOrgMemberRepo.update).toHaveBeenCalledWith(1, { role: "ADMIN" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("uses transaction when downgrading an OWNER", async () => {
    const owner = fakeOrgMember({ id: 2, organizationId: 10, role: "OWNER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([owner]);

    // Simulate transaction with 2+ owners
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        orgMember: {
          count: vi.fn().mockResolvedValue(2),
          update: vi.fn().mockResolvedValue({}),
        },
      };
      await fn(tx);
    });

    await useCase.execute({ memberId: 2, organizationId: 10, role: "ADMIN" });

    expect(mockTransaction).toHaveBeenCalled();
  });

  it("throws when downgrading the last OWNER", async () => {
    const lastOwner = fakeOrgMember({ id: 3, organizationId: 10, role: "OWNER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([lastOwner]);

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        orgMember: {
          count: vi.fn().mockResolvedValue(1),
          update: vi.fn(),
        },
      };
      await fn(tx);
    });

    await expect(useCase.execute({ memberId: 3, organizationId: 10, role: "MEMBER" })).rejects.toThrow(
      "Impossible de retirer le dernier propriétaire.",
    );
  });

  it("throws when member is not found", async () => {
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([]);

    await expect(useCase.execute({ memberId: 999, organizationId: 10, role: "ADMIN" })).rejects.toThrow(
      "Membre introuvable.",
    );
  });

  it("updates OWNER to OWNER without transaction (no-op downgrade)", async () => {
    const owner = fakeOrgMember({ id: 4, organizationId: 10, role: "OWNER" });
    mockOrgMemberRepo.findByOrgId.mockResolvedValue([owner]);
    mockOrgMemberRepo.update.mockResolvedValue({});

    await useCase.execute({ memberId: 4, organizationId: 10, role: "OWNER" });

    expect(mockOrgMemberRepo.update).toHaveBeenCalledWith(4, { role: "OWNER" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
