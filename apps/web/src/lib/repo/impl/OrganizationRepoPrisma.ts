import { prisma } from "@/lib/db/prisma";
import { type Organization, type Prisma } from "@/prisma/client";

import { type IOrganizationRepo, type OrganizationFilters, type OrganizationWithCounts } from "../IOrganizationRepo";

export class OrganizationRepoPrisma implements IOrganizationRepo {
  public count(filters: OrganizationFilters = {}): Promise<number> {
    return prisma.organization.count({ where: this.buildWhere(filters) });
  }

  public create(data: Prisma.OrganizationUncheckedCreateInput): Promise<Organization> {
    return prisma.organization.create({ data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.organization.delete({ where: { id } });
  }

  public findAll(filters: OrganizationFilters = {}, page = 1, pageSize = 20): Promise<OrganizationWithCounts[]> {
    return prisma.organization.findMany({
      where: this.buildWhere(filters),
      include: { _count: { select: { domains: true, members: true, tenants: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  public findById(id: number): Promise<null | Organization> {
    return prisma.organization.findUnique({ where: { id } });
  }

  public findBySlug(slug: string): Promise<null | Organization> {
    return prisma.organization.findUnique({ where: { slug } });
  }

  public async findByTenantId(tenantId: number): Promise<null | Organization> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { organization: true },
    });
    return tenant?.organization ?? null;
  }

  public async findByUserId(userId: string): Promise<Organization[]> {
    const memberships = await prisma.orgMember.findMany({
      where: { userId },
      include: { organization: true },
    });
    return memberships.map(m => m.organization);
  }

  public update(id: number, data: Prisma.OrganizationUncheckedUpdateInput): Promise<Organization> {
    return prisma.organization.update({ where: { id }, data });
  }

  private buildWhere(filters: OrganizationFilters): Prisma.OrganizationWhereInput {
    const where: Prisma.OrganizationWhereInput = {};
    if (filters.plan) where.plan = filters.plan;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    return where;
  }
}
