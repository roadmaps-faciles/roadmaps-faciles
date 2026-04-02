import { type IntegrationMapping, type Prisma, type TenantIntegration } from "@/prisma/client";

export type IntegrationMappingWithIntegration = { integration: TenantIntegration } & IntegrationMapping;

export interface IIntegrationMappingRepo {
  create(data: Prisma.IntegrationMappingUncheckedCreateInput): Promise<IntegrationMapping>;
  deleteAllForIntegration(integrationId: number): Promise<number>;
  findAllForIntegration(integrationId: number): Promise<IntegrationMapping[]>;
  findById(id: number): Promise<IntegrationMapping | null>;
  findByLocalEntity(integrationId: number, localType: string, localId: number): Promise<IntegrationMapping | null>;
  findByRemoteId(integrationId: number, remoteId: string): Promise<IntegrationMapping | null>;
  findInboundPostIdsForIntegration(integrationId: number): Promise<number[]>;
  findMappingsForPost(postId: number): Promise<IntegrationMappingWithIntegration[]>;
  update(id: number, data: Prisma.IntegrationMappingUncheckedUpdateInput): Promise<IntegrationMapping>;
}
