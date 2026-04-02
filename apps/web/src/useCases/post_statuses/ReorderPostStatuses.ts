import { z } from "zod";

import { type IPostStatusRepo } from "@/lib/repo/IPostStatusRepo";

import { type UseCase } from "../types";

export const ReorderPostStatusesInput = z.object({
  items: z.array(z.object({ id: z.number(), order: z.number() })),
});

export type ReorderPostStatusesInput = z.infer<typeof ReorderPostStatusesInput>;
export type ReorderPostStatusesOutput = void;

export class ReorderPostStatuses implements UseCase<ReorderPostStatusesInput, ReorderPostStatusesOutput> {
  constructor(private readonly postStatusRepo: IPostStatusRepo) {}

  public async execute(input: ReorderPostStatusesInput): Promise<ReorderPostStatusesOutput> {
    await this.postStatusRepo.reorder(input.items);
  }
}
