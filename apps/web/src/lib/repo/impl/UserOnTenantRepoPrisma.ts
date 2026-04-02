import { prisma } from "@/lib/db/prisma";
import { type Prisma, type UserOnTenant } from "@/prisma/client";

import {
  type IUserOnTenantRepo,
  type UserOnTenantWithTenant,
  type UserOnTenantWithTenantSettings,
  type UserOnTenantWithUser,
} from "../IUserOnTenantRepo";

export class UserOnTenantRepoPrisma implements IUserOnTenantRepo {
  public countOwners(tenantId: number): Promise<number> {
    return prisma.userOnTenant.count({ where: { tenantId, role: "OWNER", status: "ACTIVE" } });
  }

  public findByUserId(userId: string): Promise<UserOnTenantWithTenant[]> {
    return prisma.userOnTenant.findMany({ where: { userId }, include: { tenant: true } });
  }

  public async findByUserIdWithSettings(userId: string): Promise<UserOnTenantWithTenantSettings[]> {
    const results = await prisma.userOnTenant.findMany({
      where: { userId, status: "ACTIVE" },
      include: { tenant: { include: { settings: true } } },
    });
    return results.filter(r => r.tenant.settings !== null) as UserOnTenantWithTenantSettings[];
  }

  public findByTenantId(tenantId: number): Promise<UserOnTenantWithUser[]> {
    return prisma.userOnTenant.findMany({ where: { tenantId }, include: { user: true } });
  }

  public findMembership(userId: string, tenantId: number): Promise<null | UserOnTenant> {
    return prisma.userOnTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });
  }

  public create(data: Prisma.UserOnTenantUncheckedCreateInput): Promise<UserOnTenant> {
    return prisma.userOnTenant.create({ data });
  }

  public update(
    userId: string,
    tenantId: number,
    data: Prisma.UserOnTenantUncheckedUpdateInput,
  ): Promise<UserOnTenant> {
    return prisma.userOnTenant.update({
      where: { userId_tenantId: { userId, tenantId } },
      data,
    });
  }

  public async delete(userId: string, tenantId: number): Promise<void> {
    await prisma.userOnTenant.delete({
      where: { userId_tenantId: { userId, tenantId } },
    });
  }
}
