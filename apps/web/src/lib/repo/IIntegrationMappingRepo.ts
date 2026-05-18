import { type IntegrationMapping, type IntegrationType, type Prisma, type TenantIntegration } from "@/prisma/client";

export type IntegrationMappingWithIntegration = { integration: TenantIntegration } & IntegrationMapping;

/** Safe-to-expose subset of a mapping for public UI rendering (no credentials, no config). */
export interface PublicMappingSummary {
  integrationType: IntegrationType;
  metadata: null | Prisma.JsonValue;
  remoteUrl: null | string;
}

export interface IIntegrationMappingRepo {
  create(data: Prisma.IntegrationMappingUncheckedCreateInput): Promise<IntegrationMapping>;
  deleteAllForIntegration(integrationId: number): Promise<number>;
  findAllForIntegration(integrationId: number): Promise<IntegrationMapping[]>;
  findById(id: number): Promise<IntegrationMapping | null>;
  findByLocalEntity(integrationId: number, localType: string, localId: number): Promise<IntegrationMapping | null>;
  findByRemoteId(integrationId: number, remoteId: string): Promise<IntegrationMapping | null>;
  findInboundPostIdsForIntegration(integrationId: number): Promise<number[]>;
  findMappingsForPost(postId: number): Promise<IntegrationMappingWithIntegration[]>;
  findMappingsForPosts(postIds: number[]): Promise<IntegrationMappingWithIntegration[]>;
  /** Public-safe variant: returns only fields safe to expose to unauthenticated viewers. */
  findPublicMappingsForPosts(postIds: number[]): Promise<Map<number, PublicMappingSummary[]>>;
  update(id: number, data: Prisma.IntegrationMappingUncheckedUpdateInput): Promise<IntegrationMapping>;
}
