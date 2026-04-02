import { z } from "zod";

import { Comment, type Comment as CommentModel } from "@/lib/model/Comment";
import { type ICommentRepo } from "@/lib/repo/ICommentRepo";

import { type UseCase } from "../types";

export const UpdateCommentInput = z.object({
  commentId: z.number(),
  body: z.string().min(1),
});

export type UpdateCommentInput = z.infer<typeof UpdateCommentInput>;
export type UpdateCommentOutput = CommentModel;

export class UpdateComment implements UseCase<UpdateCommentInput, UpdateCommentOutput> {
  constructor(private readonly commentRepo: ICommentRepo) {}

  public async execute(input: UpdateCommentInput): Promise<UpdateCommentOutput> {
    const result = await this.commentRepo.update(input.commentId, {
      body: input.body,
    });
    return Comment.parse(result);
  }
}
