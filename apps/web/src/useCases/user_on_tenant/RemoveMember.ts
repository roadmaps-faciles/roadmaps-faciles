import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { UserRole } from "@/prisma/enums";

import { type UseCase } from "../types";

export const RemoveMemberInput = z.object({
  userId: z.string(),
  tenantId: z.number(),
});
export type RemoveMemberInput = z.infer<typeof RemoveMemberInput>;
export type RemoveMemberOutput = void;

export class RemoveMember implements UseCase<RemoveMemberInput, RemoveMemberOutput> {
  constructor(private readonly repo: IUserOnTenantRepo) {}

  public async execute(input: RemoveMemberInput): Promise<RemoveMemberOutput> {
    const membership = await this.repo.findMembership(input.userId, input.tenantId);
    if (!membership) {
      throw new Error("Membre introuvable.");
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
        await tx.userOnTenant.delete({
          where: { userId_tenantId: { userId: input.userId, tenantId: input.tenantId } },
        });
      });
      return;
    }

    await this.repo.delete(input.userId, input.tenantId);
  }
}
