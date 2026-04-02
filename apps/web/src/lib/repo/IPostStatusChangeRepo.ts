import { type PostStatusChange, type Prisma } from "@/prisma/client";

export interface IPostStatusChangeRepo {
  create(data: Prisma.PostStatusChangeUncheckedCreateInput): Promise<PostStatusChange>;
  findAll(): Promise<PostStatusChange[]>;
  findById(id: number): Promise<null | PostStatusChange>;
}
