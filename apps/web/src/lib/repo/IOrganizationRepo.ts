import { type Organization, type OrgPlan, type Prisma, type Tenant } from "@/prisma/client";

export interface OrganizationWithTenants extends Organization {
  tenants: Tenant[];
}

export interface OrganizationWithCounts extends Organization {
  _count: { domains: number; members: number; tenants: number };
}

export interface OrganizationFilters {
  plan?: OrgPlan;
  search?: string;
}

export interface IOrganizationRepo {
  count(filters?: OrganizationFilters): Promise<number>;
  create(data: Prisma.OrganizationUncheckedCreateInput): Promise<Organization>;
  delete(id: number): Promise<void>;
  findAll(filters?: OrganizationFilters, page?: number, pageSize?: number): Promise<OrganizationWithCounts[]>;
  findById(id: number): Promise<null | Organization>;
  findBySlug(slug: string): Promise<null | Organization>;
  findByTenantId(tenantId: number): Promise<null | Organization>;
  findByUserId(userId: string): Promise<Organization[]>;
  update(id: number, data: Prisma.OrganizationUncheckedUpdateInput): Promise<Organization>;
}
