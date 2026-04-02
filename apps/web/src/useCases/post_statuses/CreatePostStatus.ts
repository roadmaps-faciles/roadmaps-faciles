import { z } from "zod";

import { postStatusColorEnum } from "@/lib/model/PostStatus";
import { type IPostStatusRepo } from "@/lib/repo/IPostStatusRepo";
import { type PostStatus } from "@/prisma/client";

import { type UseCase } from "../types";

export const CreatePostStatusInput = z.object({
  tenantId: z.number(),
  name: z.string().min(1),
  color: postStatusColorEnum,
  showInRoadmap: z.boolean().default(true),
});

export type CreatePostStatusInput = z.infer<typeof CreatePostStatusInput>;
export type CreatePostStatusOutput = PostStatus;

export class CreatePostStatus implements UseCase<CreatePostStatusInput, CreatePostStatusOutput> {
  constructor(private readonly postStatusRepo: IPostStatusRepo) {}

  public async execute(input: CreatePostStatusInput): Promise<CreatePostStatusOutput> {
    const statuses = await this.postStatusRepo.findAllForTenant(input.tenantId);
    const maxOrder = statuses.reduce((max, s) => Math.max(max, s.order), -1);

    return this.postStatusRepo.create({
      tenantId: input.tenantId,
      name: input.name,
      color: input.color,
      showInRoadmap: input.showInRoadmap,
      order: maxOrder + 1,
    });
  }
}
