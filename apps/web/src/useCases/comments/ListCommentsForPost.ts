import { z } from "zod";

import { Comment, type Comment as CommentModel } from "@/lib/model/Comment";
import { type ICommentRepo } from "@/lib/repo/ICommentRepo";

import { type UseCase } from "../types";

export const ListCommentsForPostInput = z.object({
  postId: z.number(),
});

export type ListCommentsForPostInput = z.infer<typeof ListCommentsForPostInput>;
export type ListCommentsForPostOutput = CommentModel[];

export class ListCommentsForPost implements UseCase<ListCommentsForPostInput, ListCommentsForPostOutput> {
  constructor(private readonly commentRepo: ICommentRepo) {}

  public async execute(input: ListCommentsForPostInput): Promise<ListCommentsForPostOutput> {
    const result = await this.commentRepo.findAllForPost(input.postId);
    return result.map(c => Comment.parse(c));
  }
}
