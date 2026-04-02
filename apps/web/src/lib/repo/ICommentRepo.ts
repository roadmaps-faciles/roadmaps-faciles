import { type Comment, type Prisma } from "@/prisma/client";

export interface ICommentRepo {
  create(data: Prisma.CommentUncheckedCreateInput): Promise<Comment>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Comment[]>;
  findAllForPost(postId: number): Promise<Comment[]>;
  findById(id: number): Promise<Comment | null>;
  update(id: number, data: Prisma.CommentUncheckedUpdateInput): Promise<Comment>;
}
