import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { userRoleEnum } from "@/lib/model/User";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { UserRole } from "@/prisma/enums";

import { type UseCase } from "../types";

export const UpdateMemberRoleInput = z.object({
  userId: z.string(),
  tenantId: z.number(),
  role: userRoleEnum,
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInput>;
export type UpdateMemberRoleOutput = void;

export class UpdateMemberRole implements UseCase<UpdateMemberRoleInput, UpdateMemberRoleOutput> {
  constructor(private readonly repo: IUserOnTenantRepo) {}

  public async execute(input: UpdateMemberRoleInput): Promise<UpdateMemberRoleOutput> {
    const membership = await this.repo.findMembership(input.userId, input.tenantId);
    if (!membership) {
      throw new Error("Membre introuvable.");
    }

    if (input.role === UserRole.INHERITED || input.role === UserRole.OWNER) {
      throw new Error("Rôle cible non autorisé.");
    }

    if (membership.role === UserRole.OWNER) {
      // Transaction pour éviter une race condition TOCTOU
      await prisma.$transaction(async tx => {
        const ownerCount = await tx.userOnTenant.count({
          where: { tenantId: input.tenantId, role: "OWNER", status: "ACTIVE" },
        });
        if (ownerCount <= 1) {
          throw new Error("Impossible de retirer le dernier propriétaire.");
        }
        await tx.userOnTenant.update({
          where: { userId_tenantId: { userId: input.userId, tenantId: input.tenantId } },
          data: { role: input.role },
        });
      });
      return;
    }

    await this.repo.update(input.userId, input.tenantId, { role: input.role });
  }
}
