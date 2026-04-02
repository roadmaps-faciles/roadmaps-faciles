import { z } from "zod";

import { POST_APPROVAL_STATUS, type Post as PostModel } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";

import { type UseCase } from "../types";

const SubmitPostInputBase = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  boardId: z.number(),
  tenantId: z.number(),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  requirePostApproval: z.boolean(),
});

export const SubmitPostInput = SubmitPostInputBase.check(ctx => {
  if (!ctx.value.userId && !ctx.value.anonymousId) {
    ctx.issues.push({
      code: "custom",
      message: "Either userId or anonymousId must be provided",
      input: ctx.value,
    });
  }
});

export type SubmitPostInput = z.infer<typeof SubmitPostInput>;
export type SubmitPostOutput = PostModel;

export class SubmitPost implements UseCase<SubmitPostInput, SubmitPostOutput> {
  constructor(private readonly postRepo: IPostRepo) {}

  public async execute(input: SubmitPostInput): Promise<SubmitPostOutput> {
    const approvalStatus = input.requirePostApproval ? POST_APPROVAL_STATUS.PENDING : POST_APPROVAL_STATUS.APPROVED;

    const post = await this.postRepo.create({
      title: input.title,
      description: input.description ?? null,
      boardId: input.boardId,
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      anonymousId: input.anonymousId ?? null,
      approvalStatus,
    });

    return post as SubmitPostOutput;
  }
}
