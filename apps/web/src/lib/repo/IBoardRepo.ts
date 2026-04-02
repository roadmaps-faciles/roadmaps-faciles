import { type Board, type Prisma } from "@/prisma/client";

export interface IBoardRepo {
  create(data: Prisma.BoardUncheckedCreateInput): Promise<Board>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Board[]>;
  findAllForTenant(tenantId: number): Promise<Board[]>;
  findById(id: number): Promise<Board | null>;
  findSlugById(id: number): Promise<null | string>;
  reorder(items: Array<{ id: number; order: number }>): Promise<void>;
  update(id: number, data: Prisma.BoardUncheckedUpdateInput): Promise<Board>;
}
