import { prisma } from "@/lib/db/prisma";
import { type IntegrationMapping, type Prisma } from "@/prisma/client";

import { type IIntegrationMappingRepo, type IntegrationMappingWithIntegration } from "../IIntegrationMappingRepo";

export class IntegrationMappingRepoPrisma implements IIntegrationMappingRepo {
  public create(data: Prisma.IntegrationMappingUncheckedCreateInput): Promise<IntegrationMapping> {
    return prisma.integrationMapping.create({ data });
  }

  public findById(id: number): Promise<IntegrationMapping | null> {
    return prisma.integrationMapping.findUnique({ where: { id } });
  }

  public findAllForIntegration(integrationId: number): Promise<IntegrationMapping[]> {
    return prisma.integrationMapping.findMany({
      where: { integrationId },
      orderBy: { createdAt: "asc" },
    });
  }

  public findByLocalEntity(
    integrationId: number,
    localType: string,
    localId: number,
  ): Promise<IntegrationMapping | null> {
    return prisma.integrationMapping.findUnique({
      where: { integrationId_localType_localId: { integrationId, localType, localId } },
    });
  }

  public findByRemoteId(integrationId: number, remoteId: string): Promise<IntegrationMapping | null> {
    return prisma.integrationMapping.findFirst({
      where: { integrationId, remoteId },
    });
  }

  public findMappingsForPost(postId: number): Promise<IntegrationMappingWithIntegration[]> {
    return prisma.integrationMapping.findMany({
      where: { localType: "post", localId: postId },
      include: { integration: true },
    });
  }

  public async findInboundPostIdsForIntegration(integrationId: number): Promise<number[]> {
    const mappings = await prisma.integrationMapping.findMany({
      where: {
        integrationId,
        localType: "post",
        metadata: { path: ["direction"], equals: "inbound" },
      },
      select: { localId: true },
    });
    return mappings.map(m => m.localId);
  }

  public async deleteAllForIntegration(integrationId: number): Promise<number> {
    const result = await prisma.integrationMapping.deleteMany({ where: { integrationId } });
    return result.count;
  }

  public update(id: number, data: Prisma.IntegrationMappingUncheckedUpdateInput): Promise<IntegrationMapping> {
    return prisma.integrationMapping.update({ where: { id }, data });
  }
}
