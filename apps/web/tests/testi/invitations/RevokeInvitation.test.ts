import { RevokeInvitation } from "@/useCases/invitations/RevokeInvitation";

import {
  type createMockInvitationRepo as CreateMockInvitationRepo,
  createMockInvitationRepo,
  fakeInvitation,
} from "../helpers";

describe("RevokeInvitation", () => {
  let mockInvitationRepo: ReturnType<typeof CreateMockInvitationRepo>;
  let useCase: RevokeInvitation;

  beforeEach(() => {
    mockInvitationRepo = createMockInvitationRepo();
    useCase = new RevokeInvitation(mockInvitationRepo);
  });

  it("revokes a pending invitation successfully", async () => {
    const invitation = fakeInvitation({ id: 1, acceptedAt: null });
    mockInvitationRepo.findById.mockResolvedValue(invitation);
    mockInvitationRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 1 });

    expect(mockInvitationRepo.delete).toHaveBeenCalledWith(1);
  });

  it("throws when invitation is not found", async () => {
    mockInvitationRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999 })).rejects.toThrow("Invitation introuvable.");
  });

  it("throws when invitation is already accepted", async () => {
    const invitation = fakeInvitation({ id: 1, acceptedAt: new Date() });
    mockInvitationRepo.findById.mockResolvedValue(invitation);

    await expect(useCase.execute({ id: 1 })).rejects.toThrow("Impossible de révoquer une invitation déjà acceptée.");
  });
});
