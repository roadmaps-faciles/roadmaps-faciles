import { prisma } from "@/lib/db/prisma";
import { type Board, type Prisma } from "@/prisma/client";

import { type IBoardRepo } from "../IBoardRepo";

export class BoardRepoPrisma implements IBoardRepo {
  public findAll(): Promise<Board[]> {
    return prisma.board.findMany();
  }

  public findById(id: number): Promise<Board | null> {
    return prisma.board.findUnique({ where: { id } });
  }

  public create(data: Prisma.BoardUncheckedCreateInput): Promise<Board> {
    return prisma.board.create({ data });
  }

  public findAllForTenant(tenantId: number): Promise<Board[]> {
    return prisma.board.findMany({ where: { tenantId }, orderBy: { order: "asc" } });
  }

  public update(id: number, data: Prisma.BoardUncheckedUpdateInput): Promise<Board> {
    return prisma.board.update({ where: { id }, data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.board.delete({ where: { id } });
  }

  public async reorder(items: Array<{ id: number; order: number }>): Promise<void> {
    await prisma.$transaction(
      items.map(item => prisma.board.update({ where: { id: item.id }, data: { order: item.order } })),
    );
  }

  public async findSlugById(id: number): Promise<null | string> {
    return prisma.board.findUnique({ where: { id }, select: { slug: true } }).then(board => board?.slug ?? null);
  }
}
