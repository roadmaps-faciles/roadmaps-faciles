import { z } from "zod";

import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";

import { type UseCase } from "../types";

export const RejectPostInput = z.object({
  postId: z.number(),
  tenantId: z.number(),
});

export type RejectPostInput = z.infer<typeof RejectPostInput>;

export class RejectPost implements UseCase<RejectPostInput, void> {
  constructor(private readonly postRepo: IPostRepo) {}

  public async execute(input: RejectPostInput): Promise<void> {
    const post = await this.postRepo.findById(input.postId);
    if (!post) throw new Error("Post not found");
    if (post.tenantId !== input.tenantId) {
      throw new Error("Post does not belong to this tenant");
    }
    if (post.approvalStatus !== POST_APPROVAL_STATUS.PENDING) {
      throw new Error("Post is not pending approval");
    }

    await this.postRepo.update(input.postId, {
      approvalStatus: POST_APPROVAL_STATUS.REJECTED,
    });
  }
}
