import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { userStatusEnum } from "@/lib/model/User";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { UserRole, UserStatus } from "@/prisma/enums";

import { type UseCase } from "../types";

export const UpdateMemberStatusInput = z.object({
  userId: z.string(),
  tenantId: z.number(),
  status: userStatusEnum,
});
export type UpdateMemberStatusInput = z.infer<typeof UpdateMemberStatusInput>;
export type UpdateMemberStatusOutput = void;

export class UpdateMemberStatus implements UseCase<UpdateMemberStatusInput, UpdateMemberStatusOutput> {
  constructor(private readonly repo: IUserOnTenantRepo) {}

  public async execute(input: UpdateMemberStatusInput): Promise<UpdateMemberStatusOutput> {
    const membership = await this.repo.findMembership(input.userId, input.tenantId);
    if (!membership) {
      throw new Error("Membre introuvable.");
    }

    if (input.status === UserStatus.DELETED) {
      throw new Error("Statut cible non autorisé. Utilisez la suppression de membre.");
    }

    if (membership.role === UserRole.OWNER && input.status === UserStatus.BLOCKED) {
      // Transaction pour éviter une race condition TOCTOU
      await prisma.$transaction(async tx => {
        const ownerCount = await tx.userOnTenant.count({
          where: { tenantId: input.tenantId, role: "OWNER", status: "ACTIVE" },
        });
        if (ownerCount <= 1) {
          throw new Error("Impossible de bloquer le dernier propriétaire.");
        }
        await tx.userOnTenant.update({
          where: { userId_tenantId: { userId: input.userId, tenantId: input.tenantId } },
          data: { status: input.status },
        });
      });
      return;
    }

    await this.repo.update(input.userId, input.tenantId, { status: input.status });
  }
}
