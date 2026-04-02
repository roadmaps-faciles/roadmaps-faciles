import { UserRole } from "@/prisma/enums";
import { UpdateMemberRole } from "@/useCases/user_on_tenant/UpdateMemberRole";

import { type createMockUserOnTenantRepo as CreateMockUserOnTenantRepo, createMockUserOnTenantRepo } from "../helpers";

// Mock prisma for the $transaction used in OWNER demotion
const mockTransaction = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

describe("UpdateMemberRole", () => {
  let mockRepo: ReturnType<typeof CreateMockUserOnTenantRepo>;
  let useCase: UpdateMemberRole;

  beforeEach(() => {
    mockRepo = createMockUserOnTenantRepo();
    useCase = new UpdateMemberRole(mockRepo);
    mockTransaction.mockReset();
  });

  it("updates member role successfully", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.USER,
      status: "ACTIVE",
    });
    mockRepo.update.mockResolvedValue({});

    await useCase.execute({ userId: "user-1", tenantId: 1, role: UserRole.ADMIN });

    expect(mockRepo.update).toHaveBeenCalledWith("user-1", 1, { role: UserRole.ADMIN });
  });

  it("throws when member is not found", async () => {
    mockRepo.findMembership.mockResolvedValue(null);

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, role: UserRole.ADMIN })).rejects.toThrow(
      "Membre introuvable.",
    );
  });

  it("throws when target role is INHERITED", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.USER,
      status: "ACTIVE",
    });

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, role: UserRole.INHERITED })).rejects.toThrow(
      "Rôle cible non autorisé.",
    );
  });

  it("throws when target role is OWNER", async () => {
    mockRepo.findMembership.mockResolvedValue({
      userId: "user-1",
      tenantId: 1,
      role: UserRole.USER,
      status: "ACTIVE",
    });

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, role: UserRole.OWNER })).rejects.toThrow(
      "Rôle cible non autorisé.",
    );
  });

  it("uses transaction when demoting an OWNER", async () => {
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

    await useCase.execute({ userId: "user-1", tenantId: 1, role: UserRole.ADMIN });

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
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
          update: vi.fn(),
        },
      };
      return fn(tx);
    });

    await expect(useCase.execute({ userId: "user-1", tenantId: 1, role: UserRole.ADMIN })).rejects.toThrow(
      "Impossible de retirer le dernier propriétaire.",
    );
  });
});
