import { z } from "zod";

import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type Board } from "@/prisma/client";
import { slugify } from "@/utils/string";

import { type UseCase } from "../types";

export const CreateBoardInput = z.object({
  tenantId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateBoardInput = z.infer<typeof CreateBoardInput>;
export type CreateBoardOutput = Board;

export class CreateBoard implements UseCase<CreateBoardInput, CreateBoardOutput> {
  constructor(private readonly boardRepo: IBoardRepo) {}

  public async execute(input: CreateBoardInput): Promise<CreateBoardOutput> {
    const boards = await this.boardRepo.findAllForTenant(input.tenantId);
    const maxOrder = boards.reduce((max, b) => Math.max(max, b.order), -1);

    // Generate unique slug from name
    const baseSlug = slugify(input.name) || "board";
    const existingSlugs = new Set(boards.map(b => b.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    return this.boardRepo.create({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description ?? null,
      slug,
      order: maxOrder + 1,
    });
  }
}
