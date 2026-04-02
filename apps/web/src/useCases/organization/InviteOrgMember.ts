import { z } from "zod";

import { orgRoleEnum } from "@/lib/model/Organization";
import { type IOrgMemberRepo } from "@/lib/repo/IOrgMemberRepo";
import { type IUserRepo } from "@/lib/repo/IUserRepo";
import { type OrgMember } from "@/prisma/client";

import { type UseCase } from "../types";

export const InviteOrgMemberInput = z.object({
  organizationId: z.number(),
  email: z.string().email(),
  role: orgRoleEnum,
});

export type InviteOrgMemberInput = z.infer<typeof InviteOrgMemberInput>;
export type InviteOrgMemberOutput = OrgMember;

export class InviteOrgMember implements UseCase<InviteOrgMemberInput, InviteOrgMemberOutput> {
  constructor(
    private readonly orgMemberRepo: IOrgMemberRepo,
    private readonly userRepo: IUserRepo,
  ) {}

  public async execute(input: InviteOrgMemberInput): Promise<InviteOrgMemberOutput> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    const existing = await this.orgMemberRepo.findByOrgAndUser(input.organizationId, user.id);
    if (existing) {
      throw new Error("Cet utilisateur est déjà membre de l'organisation.");
    }

    return this.orgMemberRepo.create({
      organizationId: input.organizationId,
      userId: user.id,
      role: input.role,
    });
  }
}
