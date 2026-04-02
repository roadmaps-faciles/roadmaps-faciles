import { type Like, type Prisma } from "@/prisma/client";

export interface ILikeRepo {
  create(data: Prisma.LikeUncheckedCreateInput): Promise<Like>;
  deleteByAnonymousId(anonymousId: string, postId: number, tenantId: number): Promise<void>;
  deleteByUserId(userId: string, postId: number, tenantId: number): Promise<void>;
  findAll(): Promise<Like[]>;
  findById(id: number): Promise<Like | null>;
}
