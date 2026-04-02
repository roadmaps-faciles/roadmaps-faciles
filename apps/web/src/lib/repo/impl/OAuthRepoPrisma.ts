import { prisma } from "@/lib/db/prisma";
import { type OAuth, type Prisma } from "@/prisma/client";

import { type IOAuthRepo } from "../IOAuthRepo";

export class OAuthRepoPrisma implements IOAuthRepo {
  public findAll(): Promise<OAuth[]> {
    return prisma.oAuth.findMany();
  }

  public findById(id: number): Promise<null | OAuth> {
    return prisma.oAuth.findUnique({ where: { id } });
  }

  public create(data: Prisma.OAuthUncheckedCreateInput): Promise<OAuth> {
    return prisma.oAuth.create({ data });
  }
}
