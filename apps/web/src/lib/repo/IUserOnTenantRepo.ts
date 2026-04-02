import { type Prisma, type Tenant, type TenantSettings, type User, type UserOnTenant } from "@/prisma/client";

export interface UserOnTenantWithTenant extends UserOnTenant {
  tenant: Tenant;
}
export interface UserOnTenantWithTenantSettings extends UserOnTenant {
  tenant: { settings: TenantSettings } & Tenant;
}
export interface UserOnTenantWithUser extends UserOnTenant {
  user: User;
}

export interface IUserOnTenantRepo {
  countOwners(tenantId: number): Promise<number>;
  create(data: Prisma.UserOnTenantUncheckedCreateInput): Promise<UserOnTenant>;
  delete(userId: string, tenantId: number): Promise<void>;
  findByTenantId(tenantId: number): Promise<UserOnTenantWithUser[]>;
  findByUserId(userId: string): Promise<UserOnTenantWithTenant[]>;
  findByUserIdWithSettings(userId: string): Promise<UserOnTenantWithTenantSettings[]>;
  findMembership(userId: string, tenantId: number): Promise<null | UserOnTenant>;
  update(userId: string, tenantId: number, data: Prisma.UserOnTenantUncheckedUpdateInput): Promise<UserOnTenant>;
}
