import { type ApiKey, type Prisma } from "@/prisma/client";

export interface IApiKeyRepo {
  create(data: Prisma.ApiKeyUncheckedCreateInput): Promise<ApiKey>;
  delete(id: number): Promise<void>;
  findAll(): Promise<ApiKey[]>;
  findAllForTenant(tenantId: number): Promise<ApiKey[]>;
  findById(id: number): Promise<ApiKey | null>;
}
