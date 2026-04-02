import { UserRole } from "@/prisma/enums";
import { RemoveMember } from "@/useCases/user_on_tenant/RemoveMember";

import { type createMockUserOnTenantRepo as CreateMockUserOnTenantRepo, createMockUserOnTenantRepo } from "../helpers";

// Mock prisma for the $transaction used in OWNER removal
const mockTransaction = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

describe("RemoveMember", () => {
  let mockRepo: ReturnType<typeof CreateMockUserOnTenantRepo>;
  let useCase: RemoveMember;

  beforeEach(() => {
    mockRepo = createMockUserOnTenantRepo();
    useCase = new RemoveMember(mockRepo);
    mockTransaction.mockReset();
  });

  it("removes a non-OWNER member successfully", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.USER,
      status: "ACTIVE",
    });
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ userId: "user-1", tenantId: 1 });

    expect(mockRepo.delete).toHaveBeenCalledWith("user-1", 1);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("throws when member is not found", async () => {
    mockRepo.findMembership.mockResolvedValue(null);

    await expect(useCase.execute({ userId: "user-1", tenantId: 1 })).rejects.toThrow("Membre introuvable.");
  });

  it("uses transaction when removing an OWNER", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.OWNER,
      status: "ACTIVE",
    });

    mockTransaction.mockImplementation(async fn => {
      const tx = {
        userOnTenant: {
          count: vi.fn().mockResolvedValue(2),
          delete: vi.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    await useCase.execute({ userId: "user-1", tenantId: 1 });

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("throws when trying to remove the last OWNER", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.OWNER,
      status: "ACTIVE",
    });

    mockTransaction.mockImplementation(async fn => {
      const tx = {
        userOnTenant: {
          count: vi.fn().mockResolvedValue(1),
          delete: vi.fn(),
        },
      };
      return fn(tx);
    });

    await expect(useCase.execute({ userId: "user-1", tenantId: 1 })).rejects.toThrow(
      "Impossible de retirer le dernier propriétaire.",
    );
  });

  it("removes an ADMIN member without transaction", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.ADMIN,
      status: "ACTIVE",
    });
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ userId: "user-1", tenantId: 1 });

    expect(mockRepo.delete).toHaveBeenCalledWith("user-1", 1);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
