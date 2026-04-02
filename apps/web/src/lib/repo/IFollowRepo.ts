import { type Follow, type Prisma } from "@/prisma/client";

export interface IFollowRepo {
  create(data: Prisma.FollowUncheckedCreateInput): Promise<Follow>;
  delete(userId: string, postId: number): Promise<void>;
  findAll(): Promise<Follow[]>;
  findById(id: number): Promise<Follow | null>;
}
