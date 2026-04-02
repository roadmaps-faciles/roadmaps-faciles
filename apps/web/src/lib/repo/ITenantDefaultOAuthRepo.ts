import { type Prisma, type TenantDefaultOAuth } from "@/prisma/client";

export interface ITenantDefaultOAuthRepo {
  create(data: Prisma.TenantDefaultOAuthUncheckedCreateInput): Promise<TenantDefaultOAuth>;
  deleteByTenantIdAndProvider(tenantId: number, provider: string): Promise<void>;
  findAll(): Promise<TenantDefaultOAuth[]>;
  findById(id: number): Promise<null | TenantDefaultOAuth>;
  findByTenantId(tenantId: number): Promise<TenantDefaultOAuth[]>;
  upsertByTenantIdAndProvider(tenantId: number, provider: string): Promise<TenantDefaultOAuth>;
}
