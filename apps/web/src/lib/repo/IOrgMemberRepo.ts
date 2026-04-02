import {
  type OrgMember,
  type Organization,
  type Prisma,
  type Tenant,
  type TenantSettings,
  type User,
} from "@/prisma/client";

export interface OrgMemberWithUser extends OrgMember {
  user: User;
}

export interface OrgMemberWithOrg extends OrgMember {
  organization: Organization;
}

export interface OrgMemberWithOrgAndTenants extends OrgMember {
  organization: {
    tenants: Array<{ settings: null | TenantSettings } & Tenant>;
  } & Organization;
}

export interface IOrgMemberRepo {
  countOwners(organizationId: number): Promise<number>;
  create(data: Prisma.OrgMemberUncheckedCreateInput): Promise<OrgMember>;
  delete(id: number): Promise<void>;
  findByOrgAndUser(organizationId: number, userId: string): Promise<null | OrgMember>;
  findByOrgId(organizationId: number): Promise<OrgMemberWithUser[]>;
  findByUserId(userId: string): Promise<OrgMemberWithOrg[]>;
  findByUserIdWithOrgsAndTenants(userId: string): Promise<OrgMemberWithOrgAndTenants[]>;
  update(id: number, data: Prisma.OrgMemberUncheckedUpdateInput): Promise<OrgMember>;
}
