import { z } from "zod";

import { Post, type Post as PostModel } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";

import { type UseCase } from "../types";

export const UpdatePostRoadmapMetaInput = z.object({
  postId: z.number(),
  tenantId: z.number(),
  progress: z.number().int().min(0).max(100).nullable(),
  eta: z.string().trim().min(1).max(64).nullable(),
});

export type UpdatePostRoadmapMetaInput = z.infer<typeof UpdatePostRoadmapMetaInput>;
export type UpdatePostRoadmapMetaOutput = PostModel;

export class UpdatePostRoadmapMeta implements UseCase<UpdatePostRoadmapMetaInput, UpdatePostRoadmapMetaOutput> {
  constructor(private readonly postRepo: IPostRepo) {}

  public async execute(input: UpdatePostRoadmapMetaInput): Promise<UpdatePostRoadmapMetaOutput> {
    const existing = await this.postRepo.findById(input.postId);
    if (!existing) throw new Error("Post not found");
    if (existing.tenantId !== input.tenantId) {
      throw new Error("Post does not belong to this tenant");
    }

    const post = await this.postRepo.update(input.postId, {
      progress: input.progress,
      eta: input.eta,
    });

    return Post.parse(post);
  }
}
