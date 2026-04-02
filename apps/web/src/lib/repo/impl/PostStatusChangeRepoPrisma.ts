import { prisma } from "@/lib/db/prisma";
import { type PostStatusChange, type Prisma } from "@/prisma/client";

import { type IPostStatusChangeRepo } from "../IPostStatusChangeRepo";

export class PostStatusChangeRepoPrisma implements IPostStatusChangeRepo {
  public findAll(): Promise<PostStatusChange[]> {
    return prisma.postStatusChange.findMany();
  }

  public findById(id: number): Promise<null | PostStatusChange> {
    return prisma.postStatusChange.findUnique({ where: { id } });
  }

  public create(data: Prisma.PostStatusChangeUncheckedCreateInput): Promise<PostStatusChange> {
    return prisma.postStatusChange.create({ data });
  }
}
