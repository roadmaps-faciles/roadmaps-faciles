import { z } from "zod";

import { Like, type Like as LikeModel } from "@/lib/model/Like";
import { type ILikeRepo } from "@/lib/repo/ILikeRepo";

import { type UseCase } from "../types";

export const LikePostInputBase = z.object({
  postId: z.number(),
  tenantId: z.number(),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
});

export const LikePostInput = LikePostInputBase.check(ctx => {
  if (!ctx.value.userId && !ctx.value.anonymousId) {
    ctx.issues.push({
      code: "custom",
      message: "Either userId or anonymousId must be provided",
      input: ctx.value,
    });
  }
});

export type LikePostInput = z.infer<typeof LikePostInput>;
export type LikePostOutput = LikeModel;

export class LikePost implements UseCase<LikePostInput, LikePostOutput> {
  constructor(private readonly likeRepo: ILikeRepo) {}

  public async execute(input: LikePostInput): Promise<LikePostOutput> {
    const result = await this.likeRepo.create({
      postId: input.postId,
      tenantId: input.tenantId,
      ...(input.userId ? { userId: input.userId } : { anonymousId: input.anonymousId }),
    });

    return Like.parse(result);
  }
}
