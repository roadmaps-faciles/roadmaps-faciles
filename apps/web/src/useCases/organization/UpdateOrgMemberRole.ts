import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { orgRoleEnum } from "@/lib/model/Organization";
import { type IOrgMemberRepo } from "@/lib/repo/IOrgMemberRepo";
import { OrgRole } from "@/prisma/enums";

import { type UseCase } from "../types";

export const UpdateOrgMemberRoleInput = z.object({
  memberId: z.number(),
  organizationId: z.number(),
  role: orgRoleEnum,
});

export type UpdateOrgMemberRoleInput = z.infer<typeof UpdateOrgMemberRoleInput>;
export type UpdateOrgMemberRoleOutput = void;

export class UpdateOrgMemberRole implements UseCase<UpdateOrgMemberRoleInput, UpdateOrgMemberRoleOutput> {
  constructor(private readonly orgMemberRepo: IOrgMemberRepo) {}

  public async execute(input: UpdateOrgMemberRoleInput): Promise<UpdateOrgMemberRoleOutput> {
    const member = await this.orgMemberRepo.findByOrgId(input.organizationId);
    const target = member.find(m => m.id === input.memberId);
    if (!target) {
      throw new Error("Membre introuvable.");
    }

    if (target.role === OrgRole.OWNER && input.role !== OrgRole.OWNER) {
      // Transaction pour éviter une race condition TOCTOU
      await prisma.$transaction(async tx => {
        const ownerCount = await tx.orgMember.count({
          where: { organizationId: input.organizationId, role: OrgRole.OWNER },
        });
        if (ownerCount <= 1) {
          throw new Error("Impossible de retirer le dernier propriétaire.");
        }
        await tx.orgMember.update({
          where: { id: input.memberId },
          data: { role: input.role },
        });
      });
      return;
    }

    await this.orgMemberRepo.update(input.memberId, { role: input.role });
  }
}
