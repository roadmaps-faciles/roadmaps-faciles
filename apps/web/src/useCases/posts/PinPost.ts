import { z } from "zod";

import { type Post as PostModel } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { notImplemented } from "@/utils/error";

import { type UseCase } from "../types";

export const PinPostInput = z.object({
  boardId: z.number(),
  postId: z.number(),
  isPinned: z.boolean(),
});

export type PinPostInput = z.infer<typeof PinPostInput>;
export type PinPostOutput = PostModel;

export class PinPost implements UseCase<PinPostInput, PinPostOutput> {
  constructor(private readonly postRepo: IPostRepo) {}

  public execute(_input: PinPostInput): Promise<PinPostOutput> {
    return notImplemented();
    // const post = await this.postRepo.update(input.postId, {
    //   isPinned: input.isPinned,
    // });
    // return Post.parse({
    //   ...post,
    //   likesCount: post.likesCount,
    //   commentsCount: post.commentsCount,
    //   hotness: 0,
    //   liked: false,
    // });
  }
}
