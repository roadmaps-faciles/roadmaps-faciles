import { prisma } from "@/lib/db/prisma";
import { type Follow, type Prisma } from "@/prisma/client";

import { type IFollowRepo } from "../IFollowRepo";

export class FollowRepoPrisma implements IFollowRepo {
  public findAll(): Promise<Follow[]> {
    return prisma.follow.findMany();
  }

  public findById(id: number): Promise<Follow | null> {
    return prisma.follow.findUnique({ where: { id } });
  }

  public create(data: Prisma.FollowUncheckedCreateInput): Promise<Follow> {
    return prisma.follow.create({ data });
  }

  public async delete(userId: string, postId: number): Promise<void> {
    await prisma.follow.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }
}
