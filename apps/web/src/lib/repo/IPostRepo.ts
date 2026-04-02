import { type Post, type Prisma } from "@/prisma/client";

export interface PostCounts {
  comments: number;
  likes: number;
}

export interface IPostRepo {
  create(data: Prisma.PostUncheckedCreateInput): Promise<Post>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Post[]>;
  findAllForBoards(boardIds: number[], tenantId: number): Promise<Post[]>;
  findByBoardId(boardId: number): Promise<Post[]>;
  findById(id: number): Promise<null | Post>;
  getPostCounts(postId: number): Promise<PostCounts>;
  update(id: number, data: Prisma.PostUncheckedUpdateInput): Promise<Post>;
}
