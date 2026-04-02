import { InviteOrgMember } from "@/useCases/organization/InviteOrgMember";

import {
  type createMockOrgMemberRepo as CreateMockOrgMemberRepo,
  type createMockUserRepo as CreateMockUserRepo,
  createMockOrgMemberRepo,
  createMockUserRepo,
  fakeOrgMember,
} from "../helpers";

describe("InviteOrgMember", () => {
  let mockOrgMemberRepo: ReturnType<typeof CreateMockOrgMemberRepo>;
  let mockUserRepo: ReturnType<typeof CreateMockUserRepo>;
  let useCase: InviteOrgMember;

  beforeEach(() => {
    mockOrgMemberRepo = createMockOrgMemberRepo();
    mockUserRepo = createMockUserRepo();
    useCase = new InviteOrgMember(mockOrgMemberRepo, mockUserRepo);
  });

  it("creates a new org member when user exists and is not already a member", async () => {
    const user = { id: "user-1", email: "test@example.com", name: "Test" };
    const created = fakeOrgMember({ organizationId: 1, userId: "user-1", role: "ADMIN" });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockOrgMemberRepo.findByOrgAndUser.mockResolvedValue(null);
    mockOrgMemberRepo.create.mockResolvedValue(created);

    const result = await useCase.execute({ organizationId: 1, email: "test@example.com", role: "ADMIN" });

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockOrgMemberRepo.findByOrgAndUser).toHaveBeenCalledWith(1, "user-1");
    expect(mockOrgMemberRepo.create).toHaveBeenCalledWith({
      organizationId: 1,
      userId: "user-1",
      role: "ADMIN",
    });
    expect(result).toEqual(created);
  });

  it("throws when user is not found", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ organizationId: 1, email: "notfound@example.com", role: "MEMBER" })).rejects.toThrow(
      "Utilisateur introuvable.",
    );

    expect(mockOrgMemberRepo.create).not.toHaveBeenCalled();
  });

  it("throws when user is already a member", async () => {
    const user = { id: "user-2", email: "existing@example.com" };
    const existing = fakeOrgMember({ organizationId: 1, userId: "user-2" });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockOrgMemberRepo.findByOrgAndUser.mockResolvedValue(existing);

    await expect(useCase.execute({ organizationId: 1, email: "existing@example.com", role: "MEMBER" })).rejects.toThrow(
      "Cet utilisateur est déjà membre de l'organisation.",
    );

    expect(mockOrgMemberRepo.create).not.toHaveBeenCalled();
  });
});
