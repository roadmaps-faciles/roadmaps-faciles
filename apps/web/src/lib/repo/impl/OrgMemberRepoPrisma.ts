import { prisma } from "@/lib/db/prisma";
import { type OrgMember, type Prisma } from "@/prisma/client";

import {
  type IOrgMemberRepo,
  type OrgMemberWithOrg,
  type OrgMemberWithOrgAndTenants,
  type OrgMemberWithUser,
} from "../IOrgMemberRepo";

export class OrgMemberRepoPrisma implements IOrgMemberRepo {
  public countOwners(organizationId: number): Promise<number> {
    return prisma.orgMember.count({ where: { organizationId, role: "OWNER" } });
  }

  public create(data: Prisma.OrgMemberUncheckedCreateInput): Promise<OrgMember> {
    return prisma.orgMember.create({ data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.orgMember.delete({ where: { id } });
  }

  public findByOrgAndUser(organizationId: number, userId: string): Promise<null | OrgMember> {
    return prisma.orgMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
  }

  public findByOrgId(organizationId: number): Promise<OrgMemberWithUser[]> {
    return prisma.orgMember.findMany({
      where: { organizationId },
      include: { user: true },
    });
  }

  public findByUserId(userId: string): Promise<OrgMemberWithOrg[]> {
    return prisma.orgMember.findMany({
      where: { userId },
      include: { organization: true },
    });
  }

  public findByUserIdWithOrgsAndTenants(userId: string): Promise<OrgMemberWithOrgAndTenants[]> {
    return prisma.orgMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            tenants: {
              where: { deletedAt: null },
              include: { settings: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { organization: { name: "asc" } },
    });
  }

  public update(id: number, data: Prisma.OrgMemberUncheckedUpdateInput): Promise<OrgMember> {
    return prisma.orgMember.update({ where: { id }, data });
  }
}
