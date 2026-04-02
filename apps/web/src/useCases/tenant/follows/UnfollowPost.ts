import { z } from "zod";

import { type IFollowRepo } from "@/lib/repo/IFollowRepo";

import { type UseCase } from "../../types";

export const UnfollowPostInput = z.object({
  postId: z.number(),
  userId: z.string(),
});

export type UnfollowPostInput = z.infer<typeof UnfollowPostInput>;
export type UnfollowPostOutput = void;

export class UnfollowPost implements UseCase<UnfollowPostInput, UnfollowPostOutput> {
  constructor(private readonly followRepo: IFollowRepo) {}

  public async execute(input: UnfollowPostInput): Promise<UnfollowPostOutput> {
    await this.followRepo.delete(input.userId, input.postId);
  }
}
