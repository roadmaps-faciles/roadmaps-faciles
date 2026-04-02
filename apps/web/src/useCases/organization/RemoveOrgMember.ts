import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { type IOrgMemberRepo } from "@/lib/repo/IOrgMemberRepo";
import { OrgRole } from "@/prisma/enums";

import { type UseCase } from "../types";

export const RemoveOrgMemberInput = z.object({
  memberId: z.number(),
  organizationId: z.number(),
});

export type RemoveOrgMemberInput = z.infer<typeof RemoveOrgMemberInput>;
export type RemoveOrgMemberOutput = void;

export class RemoveOrgMember implements UseCase<RemoveOrgMemberInput, RemoveOrgMemberOutput> {
  constructor(private readonly orgMemberRepo: IOrgMemberRepo) {}

  public async execute(input: RemoveOrgMemberInput): Promise<RemoveOrgMemberOutput> {
    const members = await this.orgMemberRepo.findByOrgId(input.organizationId);
    const target = members.find(m => m.id === input.memberId);
    if (!target) {
      throw new Error("Membre introuvable.");
    }

    if (target.role === OrgRole.OWNER) {
      await prisma.$transaction(async tx => {
        const ownerCount = await tx.orgMember.count({
          where: { organizationId: input.organizationId, role: OrgRole.OWNER },
        });
        if (ownerCount <= 1) {
          throw new Error("Impossible de retirer le dernier propriétaire.");
        }
        await tx.orgMember.delete({ where: { id: input.memberId } });
      });
      return;
    }

    await this.orgMemberRepo.delete(input.memberId);
  }
}
