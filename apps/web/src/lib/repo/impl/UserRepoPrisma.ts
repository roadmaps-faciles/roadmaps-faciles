import { prisma } from "@/lib/db/prisma";
import { type Prisma, type User } from "@/prisma/client";

import { type IUserRepo, type UserEmailSearchResult, type UserWithTenantCount } from "../IUserRepo";

export class UserRepoPrisma implements IUserRepo {
  public findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  public findAllWithTenantCount(): Promise<UserWithTenantCount[]> {
    return prisma.user.findMany({
      include: {
        _count: { select: { memberships: true } },
      },
    });
  }

  public findById(id: string): Promise<null | User> {
    return prisma.user.findUnique({ where: { id } });
  }

  public findByUsername(username: string): Promise<null | User> {
    return prisma.user.findUnique({ where: { username } });
  }

  public findByEmail(email: string): Promise<null | User> {
    return prisma.user.findUnique({ where: { email } });
  }

  public create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  public searchByEmail(query: string, limit = 10): Promise<UserEmailSearchResult[]> {
    return prisma.user.findMany({
      where: { email: { contains: query, mode: "insensitive" }, status: "ACTIVE" },
      select: { id: true, email: true, name: true },
      take: limit,
    });
  }

  public async update(id: string, data: Prisma.UserUncheckedUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
