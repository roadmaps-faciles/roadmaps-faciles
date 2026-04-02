import { z } from "zod";

import { PostStatusChange, type PostStatusChange as PostStatusChangeModel } from "@/lib/model/PostStatusChange";
import { type IPostStatusChangeRepo } from "@/lib/repo/IPostStatusChangeRepo";

import { type UseCase } from "../types";

export const ChangePostStatusInput = z.object({
  postId: z.number(),
  fromStatusId: z.number().nullable(),
  toStatusId: z.number(),
  userId: z.string(),
  tenantId: z.number(),
});

export type ChangePostStatusInput = z.infer<typeof ChangePostStatusInput>;
export type ChangePostStatusOutput = PostStatusChangeModel;

// TODO: wire trackServerEvent(postStatusChanged(...)) when a server action calls this use case
export class ChangePostStatus implements UseCase<ChangePostStatusInput, ChangePostStatusOutput> {
  constructor(private readonly postStatusChangeRepo: IPostStatusChangeRepo) {}

  public async execute(input: ChangePostStatusInput): Promise<ChangePostStatusOutput> {
    const change = await this.postStatusChangeRepo.create(input);
    return PostStatusChange.parse(change);
  }
}
