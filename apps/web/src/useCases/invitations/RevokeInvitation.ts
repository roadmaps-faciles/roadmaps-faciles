import { z } from "zod";

import { type IInvitationRepo } from "@/lib/repo/IInvitationRepo";

import { type UseCase } from "../types";

export const RevokeInvitationInput = z.object({
  id: z.number(),
});

export type RevokeInvitationInput = z.infer<typeof RevokeInvitationInput>;
export type RevokeInvitationOutput = void;

export class RevokeInvitation implements UseCase<RevokeInvitationInput, RevokeInvitationOutput> {
  constructor(private readonly invitationRepo: IInvitationRepo) {}

  public async execute(input: RevokeInvitationInput): Promise<RevokeInvitationOutput> {
    const invitation = await this.invitationRepo.findById(input.id);
    if (!invitation) {
      throw new Error("Invitation introuvable.");
    }

    if (invitation.acceptedAt) {
      throw new Error("Impossible de révoquer une invitation déjà acceptée.");
    }

    await this.invitationRepo.delete(input.id);
  }
}
