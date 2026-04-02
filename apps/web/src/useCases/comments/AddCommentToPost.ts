import { z } from "zod";

import { Comment, type Comment as CommentModel } from "@/lib/model/Comment";
import { type ICommentRepo } from "@/lib/repo/ICommentRepo";

import { type UseCase } from "../types";

export const AddCommentToPostInput = z.object({
  postId: z.number(),
  userId: z.string(),
  tenantId: z.number(),
  body: z.string().min(1),
});

export type AddCommentToPostInput = z.infer<typeof AddCommentToPostInput>;
export type AddCommentToPostOutput = CommentModel;

export class AddCommentToPost implements UseCase<AddCommentToPostInput, AddCommentToPostOutput> {
  constructor(private readonly commentRepo: ICommentRepo) {}

  public async execute(input: AddCommentToPostInput): Promise<AddCommentToPostOutput> {
    const result = await this.commentRepo.create({
      postId: input.postId,
      userId: input.userId,
      tenantId: input.tenantId,
      body: input.body,
    });
    return Comment.parse(result);
  }
}
