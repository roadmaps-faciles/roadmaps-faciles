import { prisma } from "@/lib/db/prisma";
import { type Post, type Prisma } from "@/prisma/client";

import { type IPostRepo, type PostCounts } from "../IPostRepo";

export class PostRepoPrisma implements IPostRepo {
  public findAll(): Promise<Post[]> {
    return prisma.post.findMany();
  }

  public findById(id: number): Promise<null | Post> {
    return prisma.post.findUnique({ where: { id } });
  }

  public findAllForBoards(boardIds: number[], tenantId: number): Promise<Post[]> {
    return prisma.post.findMany({
      where: { boardId: { in: boardIds }, tenantId, approvalStatus: "APPROVED" },
      orderBy: { updatedAt: "asc" },
    });
  }

  public findByBoardId(boardId: number): Promise<Post[]> {
    return prisma.post.findMany({
      where: { boardId },
      include: {
        _count: {
          select: {
            comments: true,
            follows: true,
            likes: true,
          },
        },
      },
    });
  }

  public create(data: Prisma.PostUncheckedCreateInput): Promise<Post> {
    return prisma.post.create({ data });
  }

  public update(id: number, data: Prisma.PostUncheckedUpdateInput): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data,
    });
  }

  public async getPostCounts(postId: number): Promise<PostCounts> {
    const result = await prisma.post.findUnique({
      where: { id: postId },
      select: { _count: { select: { comments: true, likes: true } } },
    });
    return result?._count ?? { comments: 0, likes: 0 };
  }

  public async delete(id: number): Promise<void> {
    await prisma.post.delete({
      where: { id },
    });
  }
}
