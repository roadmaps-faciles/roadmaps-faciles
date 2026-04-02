import { UserRole } from "@/prisma/enums";
import { UpdateMemberStatus } from "@/useCases/user_on_tenant/UpdateMemberStatus";

import { type createMockUserOnTenantRepo as CreateMockUserOnTenantRepo, createMockUserOnTenantRepo } from "../helpers";

// Mock prisma for the $transaction used in OWNER blocking
const mockTransaction = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

describe("UpdateMemberStatus", () => {
  let mockRepo: ReturnType<typeof CreateMockUserOnTenantRepo>;
  let useCase: UpdateMemberStatus;

  beforeEach(() => {
    mockRepo = createMockUserOnTenantRepo();
    useCase = new UpdateMemberStatus(mockRepo);
    mockTransaction.mockReset();
  });

  it("updates member status successfully", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.USER,
      status: "ACTIVE",
    });
    mockRepo.update.mockResolvedValue({});

    await useCase.execute({ userId: "user-1", tenantId: 1, status: "BLOCKED" });

    expect(mockRepo.update).toHaveBeenCalledWith("user-1", 1, { status: "BLOCKED" });
  });

  it("throws when member is not found", async () => {
    mockRepo.findMembership.mockResolvedValue(null);

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, status: "BLOCKED" })).rejects.toThrow(
      "Membre introuvable.",
    );
  });

  it("throws when target status is DELETED", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.USER,
      status: "ACTIVE",
    });

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, status: "DELETED" })).rejects.toThrow(
      "Statut cible non autorisé. Utilisez la suppression de membre.",
    );
  });

  it("uses transaction when blocking an OWNER", async () => {
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
          update: vi.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    await useCase.execute({ userId: "user-1", tenantId: 1, status: "BLOCKED" });

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("throws when trying to block the last OWNER", async () => {
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
          update: vi.fn(),
        },
      };
      return fn(tx);
    });

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, status: "BLOCKED" })).rejects.toThrow(
      "Impossible de bloquer le dernier propriétaire.",
    );
  });

  it("does not use transaction for non-OWNER members", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.ADMIN,
      status: "ACTIVE",
    });
    mockRepo.update.mockResolvedValue({});

    await useCase.execute({ userId: "user-1", tenantId: 1, status: "BLOCKED" });

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockRepo.update).toHaveBeenCalledWith("user-1", 1, { status: "BLOCKED" });
  });
});
