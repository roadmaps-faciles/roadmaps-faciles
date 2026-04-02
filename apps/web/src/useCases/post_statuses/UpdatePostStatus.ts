import { z } from "zod";

import { postStatusColorEnum } from "@/lib/model/PostStatus";
import { type IPostStatusRepo } from "@/lib/repo/IPostStatusRepo";
import { type PostStatus } from "@/prisma/client";

import { type UseCase } from "../types";

export const UpdatePostStatusInput = z.object({
  id: z.number(),
  name: z.string().min(1),
  color: postStatusColorEnum,
  showInRoadmap: z.boolean(),
});

export type UpdatePostStatusInput = z.infer<typeof UpdatePostStatusInput>;
export type UpdatePostStatusOutput = PostStatus;

export class UpdatePostStatus implements UseCase<UpdatePostStatusInput, UpdatePostStatusOutput> {
  constructor(private readonly postStatusRepo: IPostStatusRepo) {}

  public async execute(input: UpdatePostStatusInput): Promise<UpdatePostStatusOutput> {
    return this.postStatusRepo.update(input.id, {
      name: input.name,
      color: input.color,
      showInRoadmap: input.showInRoadmap,
    });
  }
}
