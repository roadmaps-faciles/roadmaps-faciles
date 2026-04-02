import { prisma } from "@/lib/db/prisma";
import { type ApiKey, type Prisma } from "@/prisma/client";

import { type IApiKeyRepo } from "../IApiKeyRepo";

export class ApiKeyRepoPrisma implements IApiKeyRepo {
  public findAll(): Promise<ApiKey[]> {
    return prisma.apiKey.findMany();
  }

  public findById(id: number): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({ where: { id } });
  }

  public create(data: Prisma.ApiKeyUncheckedCreateInput): Promise<ApiKey> {
    return prisma.apiKey.create({ data });
  }

  public async delete(id: number): Promise<void> {
    await prisma.apiKey.delete({ where: { id } });
  }

  public findAllForTenant(tenantId: number): Promise<ApiKey[]> {
    return prisma.apiKey.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }
}
