import { z } from "zod";

import { type Post as PostModel } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { notImplemented } from "@/utils/error";

import { type UseCase } from "../types";

export const ArchivePostInput = z.object({
  postId: z.number(),
  isArchived: z.boolean(),
});

export type ArchivePostInput = z.infer<typeof ArchivePostInput>;
export type ArchivePostOutput = PostModel;

export class ArchivePost implements UseCase<ArchivePostInput, ArchivePostOutput> {
  constructor(private readonly postRepo: IPostRepo) {}

  public execute(_input: ArchivePostInput): Promise<ArchivePostOutput> {
    return notImplemented();
  }
}
