import { type OAuth, type Prisma } from "@/prisma/client";

export interface IOAuthRepo {
  create(data: Prisma.OAuthUncheckedCreateInput): Promise<OAuth>;
  findAll(): Promise<OAuth[]>;
  findById(id: number): Promise<null | OAuth>;
}
