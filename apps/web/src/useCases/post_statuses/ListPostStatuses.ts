import { z } from "zod";

import { PostStatus, type PostStatus as PostStatusModel } from "@/lib/model/PostStatus";
import { type IPostStatusRepo } from "@/lib/repo/IPostStatusRepo";

import { type UseCase } from "../types";

export const ListPostStatusesInput = z.object({
  tenantId: z.number(),
});

export type ListPostStatusesInput = z.infer<typeof ListPostStatusesInput>;
export type ListPostStatusesOutput = PostStatusModel[];

export class ListPostStatuses implements UseCase<ListPostStatusesInput, ListPostStatusesOutput> {
  constructor(private readonly postStatusRepo: IPostStatusRepo) {}

  public async execute(input: ListPostStatusesInput): Promise<ListPostStatusesOutput> {
    const results = await this.postStatusRepo.findAllForTenant(input.tenantId);
    return results.map(r => PostStatus.parse(r));
  }
}
