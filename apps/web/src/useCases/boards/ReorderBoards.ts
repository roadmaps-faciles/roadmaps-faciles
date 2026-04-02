import { z } from "zod";

import { type IBoardRepo } from "@/lib/repo/IBoardRepo";

import { type UseCase } from "../types";

export const ReorderBoardsInput = z.object({
  items: z.array(z.object({ id: z.number(), order: z.number() })),
});

export type ReorderBoardsInput = z.infer<typeof ReorderBoardsInput>;
export type ReorderBoardsOutput = void;

export class ReorderBoards implements UseCase<ReorderBoardsInput, ReorderBoardsOutput> {
  constructor(private readonly boardRepo: IBoardRepo) {}

  public async execute(input: ReorderBoardsInput): Promise<ReorderBoardsOutput> {
    await this.boardRepo.reorder(input.items);
  }
}
