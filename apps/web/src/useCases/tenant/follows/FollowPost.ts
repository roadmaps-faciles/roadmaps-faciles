import { z } from "zod";

import { Follow, type Follow as FollowModel } from "@/lib/model/Follow";
import { type IFollowRepo } from "@/lib/repo/IFollowRepo";

import { type UseCase } from "../../types";

export const FollowPostInput = z.object({
  postId: z.number(),
  userId: z.string(),
  tenantId: z.number(),
});

export type FollowPostInput = z.infer<typeof FollowPostInput>;
export type FollowPostOutput = FollowModel;

export class FollowPost implements UseCase<FollowPostInput, FollowPostOutput> {
  constructor(private readonly followRepo: IFollowRepo) {}

  public async execute(input: FollowPostInput): Promise<FollowPostOutput> {
    const result = await this.followRepo.create({
      postId: input.postId,
      userId: input.userId,
      tenantId: input.tenantId,
    });

    return Follow.parse(result);
  }
}
