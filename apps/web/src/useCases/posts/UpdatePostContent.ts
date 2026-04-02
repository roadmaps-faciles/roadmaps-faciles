import { z } from "zod";

import { Post, type Post as PostModel } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";

import { type UseCase } from "../types";

export const UpdatePostContentInput = z.object({
  postId: z.number(),
  tenantId: z.number(),
  title: z.string().min(3),
  description: z.string().optional(),
  tags: z.string().array().optional(),
  editedById: z.string(),
});

export type UpdatePostContentInput = z.infer<typeof UpdatePostContentInput>;
export type UpdatePostContentOutput = PostModel;

export class UpdatePostContent implements UseCase<UpdatePostContentInput, UpdatePostContentOutput> {
  constructor(private readonly postRepo: IPostRepo) {}

  public async execute(input: UpdatePostContentInput): Promise<UpdatePostContentOutput> {
    const existing = await this.postRepo.findById(input.postId);
    if (!existing) throw new Error("Post not found");
    if (existing.tenantId !== input.tenantId) {
      throw new Error("Post does not belong to this tenant");
    }

    const post = await this.postRepo.update(input.postId, {
      title: input.title,
      description: input.description ?? null,
      ...(input.tags !== undefined && { tags: input.tags }),
      editedAt: new Date(),
      editedById: input.editedById,
    });

    return Post.parse(post);
  }
}
