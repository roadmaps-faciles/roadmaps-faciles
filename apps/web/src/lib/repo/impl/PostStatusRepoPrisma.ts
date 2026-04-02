import { prisma } from "@/lib/db/prisma";
import { type PostStatus, type Prisma } from "@/prisma/client";

import { type IPostStatusRepo } from "../IPostStatusRepo";

export class PostStatusRepoPrisma implements IPostStatusRepo {
  public findAll(): Promise<PostStatus[]> {
    return prisma.postStatus.findMany();
  }

  public findById(id: number): Promise<null | PostStatus> {
    return prisma.postStatus.findUnique({ where: { id } });
  }

  public create(data: Prisma.PostStatusUncheckedCreateInput): Promise<PostStatus> {
    return prisma.postStatus.create({ data });
  }

  public findAllForTenant(tenantId: number): Promise<PostStatus[]> {
    return prisma.postStatus.findMany({
      where: { tenantId },
      orderBy: { order: "asc" },
    });
  }

  public update(id: number, data: Prisma.PostStatusUncheckedUpdateInput): Promise<PostStatus> {
    return prisma.postStatus.update({ where: { id }, data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.postStatus.delete({ where: { id } });
  }

  public async reorder(items: Array<{ id: number; order: number }>): Promise<void> {
    await prisma.$transaction(
      items.map(item => prisma.postStatus.update({ where: { id: item.id }, data: { order: item.order } })),
    );
  }
}
