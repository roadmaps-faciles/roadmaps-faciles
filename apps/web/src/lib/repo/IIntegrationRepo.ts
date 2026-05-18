import { type Prisma, type TenantIntegration } from "@/prisma/client";

export interface IIntegrationRepo {
  create(data: Prisma.TenantIntegrationUncheckedCreateInput): Promise<TenantIntegration>;
  delete(id: number): Promise<void>;
  findAllForTenant(tenantId: number): Promise<TenantIntegration[]>;
  findByGitHubInstallationId(installationId: number): Promise<null | TenantIntegration>;
  findById(id: number): Promise<null | TenantIntegration>;
  findDueForSync(): Promise<TenantIntegration[]>;
  update(id: number, data: Prisma.TenantIntegrationUncheckedUpdateInput): Promise<TenantIntegration>;
}
