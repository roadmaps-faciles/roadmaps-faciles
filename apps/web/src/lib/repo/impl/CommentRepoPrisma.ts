import { prisma } from "@/lib/db/prisma";
import { type Comment, type Prisma } from "@/prisma/client";

import { type ICommentRepo } from "../ICommentRepo";

export class CommentRepoPrisma implements ICommentRepo {
  public findAll(): Promise<Comment[]> {
    return prisma.comment.findMany();
  }

  public findById(id: number): Promise<Comment | null> {
    return prisma.comment.findUnique({ where: { id } });
  }

  public create(data: Prisma.CommentUncheckedCreateInput): Promise<Comment> {
    return prisma.comment.create({ data });
  }

  public findAllForPost(postId: number): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
    });
  }

  public update(id: number, data: Prisma.CommentUncheckedUpdateInput): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data,
    });
  }

  public async delete(id: number): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
}
