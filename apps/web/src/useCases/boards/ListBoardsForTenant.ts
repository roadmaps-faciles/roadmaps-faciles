import { z } from "zod";

import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type Board } from "@/prisma/client";

import { type UseCase } from "../types";

export const ListBoardsForTenantInput = z.object({
  tenantId: z.number(),
});

export type ListBoardsForTenantInput = z.infer<typeof ListBoardsForTenantInput>;
export type ListBoardsForTenantOutput = Board[];

export class ListBoardsForTenant implements UseCase<ListBoardsForTenantInput, ListBoardsForTenantOutput> {
  constructor(private readonly boardRepo: IBoardRepo) {}

  public async execute(input: ListBoardsForTenantInput): Promise<ListBoardsForTenantOutput> {
    return this.boardRepo.findAllForTenant(input.tenantId);
  }
}
