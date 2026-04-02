import { z } from "zod";

import { type ICommentRepo } from "@/lib/repo/ICommentRepo";

import { type UseCase } from "../types";

export const DeleteCommentInput = z.object({
  commentId: z.number(),
});

export type DeleteCommentInput = z.infer<typeof DeleteCommentInput>;
export type DeleteCommentOutput = void;

export class DeleteComment implements UseCase<DeleteCommentInput, DeleteCommentOutput> {
  constructor(private readonly commentRepo: ICommentRepo) {}

  public async execute(input: DeleteCommentInput): Promise<DeleteCommentOutput> {
    await this.commentRepo.delete(input.commentId);
  }
}
