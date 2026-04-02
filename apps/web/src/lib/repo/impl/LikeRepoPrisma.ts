import { prisma } from "@/lib/db/prisma";
import { type Like, type Prisma } from "@/prisma/client";

import { type ILikeRepo } from "../ILikeRepo";

export class LikeRepoPrisma implements ILikeRepo {
  public findAll(): Promise<Like[]> {
    return prisma.like.findMany();
  }

  public findById(id: number): Promise<Like | null> {
    return prisma.like.findUnique({ where: { id } });
  }

  public create(data: Prisma.LikeUncheckedCreateInput): Promise<Like> {
    return prisma.like.create({ data });
  }

  public async deleteByUserId(userId: string, postId: number): Promise<void> {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  public async deleteByAnonymousId(anonymousId: string, postId: number): Promise<void> {
    await prisma.like.delete({
      where: {
        anonymousId_postId: {
          anonymousId,
          postId,
        },
      },
    });
  }
}
