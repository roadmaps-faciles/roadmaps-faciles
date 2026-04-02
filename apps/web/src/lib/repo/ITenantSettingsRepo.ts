import { type Prisma, type TenantSettings } from "@/prisma/client";

export interface ITenantSettingsRepo {
  create(data: Prisma.TenantSettingsUncheckedCreateInput): Promise<TenantSettings>;
  findAll(): Promise<TenantSettings[]>;
  findById(id: number): Promise<null | TenantSettings>;
  findByTenantId(tenantId: number): Promise<null | TenantSettings>;
  update(id: number, data: Prisma.TenantSettingsUncheckedUpdateInput): Promise<TenantSettings>;
}
