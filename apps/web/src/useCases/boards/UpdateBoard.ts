import { z } from "zod";

import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type Board } from "@/prisma/client";

import { type UseCase } from "../types";

export const UpdateBoardInput = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export type UpdateBoardInput = z.infer<typeof UpdateBoardInput>;
export type UpdateBoardOutput = Board;

export class UpdateBoard implements UseCase<UpdateBoardInput, UpdateBoardOutput> {
  constructor(private readonly boardRepo: IBoardRepo) {}

  public async execute(input: UpdateBoardInput): Promise<UpdateBoardOutput> {
    return this.boardRepo.update(input.id, {
      name: input.name,
      description: input.description ?? null,
    });
  }
}
