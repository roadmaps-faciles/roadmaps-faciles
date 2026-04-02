import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";

import { type UseCase } from "../types";

export const DeleteBoardInput = z.object({
  id: z.number(),
});

export type DeleteBoardInput = z.infer<typeof DeleteBoardInput>;
export type DeleteBoardOutput = void;

export class DeleteBoard implements UseCase<DeleteBoardInput, DeleteBoardOutput> {
  constructor(
    private readonly boardRepo: IBoardRepo,
    private readonly tenantSettingsRepo: ITenantSettingsRepo,
  ) {}

  public async execute(input: DeleteBoardInput): Promise<DeleteBoardOutput> {
    const board = await this.boardRepo.findById(input.id);
    if (!board) {
      throw new Error("Board introuvable.");
    }

    const postsCount = await prisma.post.count({ where: { boardId: input.id } });
    if (postsCount > 0) {
      throw new Error("Impossible de supprimer un board qui contient des posts.");
    }

    const settings = await this.tenantSettingsRepo.findByTenantId(board.tenantId);
    if (settings?.rootBoardId === input.id) {
      throw new Error("Impossible de supprimer le board utilisé comme page principale (roadmap).");
    }

    await this.boardRepo.delete(input.id);
  }
}
