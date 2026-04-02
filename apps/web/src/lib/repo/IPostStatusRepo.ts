import { type PostStatus, type Prisma } from "@/prisma/client";

export interface IPostStatusRepo {
  create(data: Prisma.PostStatusUncheckedCreateInput): Promise<PostStatus>;
  delete(id: number): Promise<void>;
  findAll(): Promise<PostStatus[]>;
  findAllForTenant(tenantId: number): Promise<PostStatus[]>;
  findById(id: number): Promise<null | PostStatus>;
  reorder(items: Array<{ id: number; order: number }>): Promise<void>;
  update(id: number, data: Prisma.PostStatusUncheckedUpdateInput): Promise<PostStatus>;
}
