import { z } from "zod";

import { type IPostRepo } from "@/lib/repo/IPostRepo";

import { type UseCase } from "../types";

export const DeletePostInput = z.object({
  postId: z.number(),
  tenantId: z.number(),
});

export type DeletePostInput = z.infer<typeof DeletePostInput>;

export class DeletePost implements UseCase<DeletePostInput, void> {
  constructor(private readonly postRepo: IPostRepo) {}

  public async execute(input: DeletePostInput): Promise<void> {
    const post = await this.postRepo.findById(input.postId);
    if (!post) throw new Error("Post not found");
    if (post.tenantId !== input.tenantId) {
      throw new Error("Post does not belong to this tenant");
    }

    await this.postRepo.delete(input.postId);
  }
}
