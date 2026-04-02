import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { type IPostStatusRepo } from "@/lib/repo/IPostStatusRepo";

import { type UseCase } from "../types";

export const DeletePostStatusInput = z.object({
  id: z.number(),
});

export type DeletePostStatusInput = z.infer<typeof DeletePostStatusInput>;
export type DeletePostStatusOutput = void;

export class DeletePostStatus implements UseCase<DeletePostStatusInput, DeletePostStatusOutput> {
  constructor(private readonly postStatusRepo: IPostStatusRepo) {}

  public async execute(input: DeletePostStatusInput): Promise<DeletePostStatusOutput> {
    const postsCount = await prisma.post.count({ where: { postStatusId: input.id } });
    if (postsCount > 0) {
      throw new Error("Impossible de supprimer un statut utilisé par des posts.");
    }

    await this.postStatusRepo.delete(input.id);
  }
}
