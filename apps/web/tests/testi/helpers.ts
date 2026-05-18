import { faker } from "@faker-js/faker";
import { type Mock, vi } from "vitest";

import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { type ICommentRepo } from "@/lib/repo/ICommentRepo";
import { type IIntegrationMappingRepo } from "@/lib/repo/IIntegrationMappingRepo";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IIntegrationSyncLogRepo } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IInvitationRepo } from "@/lib/repo/IInvitationRepo";
import { type ILikeRepo } from "@/lib/repo/ILikeRepo";
import { type IOrgAddonRepo } from "@/lib/repo/IOrgAddonRepo";
import { type IOrganizationRepo } from "@/lib/repo/IOrganizationRepo";
import { type IOrgDomainRepo } from "@/lib/repo/IOrgDomainRepo";
import { type IOrgMemberRepo } from "@/lib/repo/IOrgMemberRepo";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { type IPostStatusChangeRepo } from "@/lib/repo/IPostStatusChangeRepo";
import { type IPostStatusRepo } from "@/lib/repo/IPostStatusRepo";
import { type ITenantRepo } from "@/lib/repo/ITenantRepo";
import { type ITenantSettingsRepo } from "@/lib/repo/ITenantSettingsRepo";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { type IUserRepo } from "@/lib/repo/IUserRepo";
import { type IWebhookRepo } from "@/lib/repo/IWebhookRepo";

type MockRepo<T> = { [K in keyof T]: Mock };

export function createMockPostRepo(): MockRepo<IPostRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findAllForBoards: vi.fn(),
    findByBoardId: vi.fn(),
    findById: vi.fn(),
    getPostCounts: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockIntegrationRepo(): MockRepo<IIntegrationRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAllForTenant: vi.fn(),
    findById: vi.fn(),
    findByGitHubInstallationId: vi.fn(),
    findDueForSync: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockIntegrationMappingRepo(): MockRepo<IIntegrationMappingRepo> {
  return {
    create: vi.fn(),
    deleteAllForIntegration: vi.fn(),
    findAllForIntegration: vi.fn(),
    findById: vi.fn(),
    findByLocalEntity: vi.fn(),
    findByRemoteId: vi.fn(),
    findInboundPostIdsForIntegration: vi.fn(),
    findMappingsForPost: vi.fn(),
    findMappingsForPosts: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockSyncLogRepo(): MockRepo<IIntegrationSyncLogRepo> {
  return {
    create: vi.fn(),
    findRecentForIntegration: vi.fn(),
    findSyncRuns: vi.fn(),
  };
}

export function createMockBoardRepo(): MockRepo<IBoardRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findAllForTenant: vi.fn(),
    findById: vi.fn(),
    findSlugById: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockTenantRepo(): MockRepo<ITenantRepo> {
  return {
    countByOrganizationId: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    findAllForUser: vi.fn(),
    findAllWithSettings: vi.fn(),
    findByCustomDomain: vi.fn(),
    findById: vi.fn(),
    findByIdWithSettings: vi.fn(),
    findBySubdomain: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockTenantSettingsRepo(): MockRepo<ITenantSettingsRepo> {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByTenantId: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockInvitationRepo(): MockRepo<IInvitationRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findAllForTenant: vi.fn(),
    findByEmailAndTenant: vi.fn(),
    findById: vi.fn(),
  };
}

export function createMockUserRepo(): MockRepo<IUserRepo> {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findAllWithTenantCount: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findByUsername: vi.fn(),
    searchByEmail: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockUserOnTenantRepo(): MockRepo<IUserOnTenantRepo> {
  return {
    countOwners: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findByTenantId: vi.fn(),
    findByUserId: vi.fn(),
    findByUserIdWithSettings: vi.fn(),
    findMembership: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockCommentRepo(): MockRepo<ICommentRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findAllForPost: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockLikeRepo(): MockRepo<ILikeRepo> {
  return {
    create: vi.fn(),
    deleteByAnonymousId: vi.fn(),
    deleteByUserId: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
  };
}

export function createMockPostStatusRepo(): MockRepo<IPostStatusRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findAllForTenant: vi.fn(),
    findById: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockPostStatusChangeRepo(): MockRepo<IPostStatusChangeRepo> {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
  };
}

export function createMockWebhookRepo(): MockRepo<IWebhookRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findAllForTenant: vi.fn(),
    findById: vi.fn(),
  };
}

export function createMockOrganizationRepo(): MockRepo<IOrganizationRepo> {
  return {
    count: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findByTenantId: vi.fn(),
    findByUserId: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockOrgMemberRepo(): MockRepo<IOrgMemberRepo> {
  return {
    countOwners: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findByOrgAndUser: vi.fn(),
    findByOrgId: vi.fn(),
    findByUserId: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockOrgDomainRepo(): MockRepo<IOrgDomainRepo> {
  return {
    create: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByDomain: vi.fn(),
    findByOrgId: vi.fn(),
    findByVerificationToken: vi.fn(),
    findUnverified: vi.fn(),
    verify: vi.fn(),
  };
}

export function createMockOrgAddonRepo(): MockRepo<IOrgAddonRepo> {
  return {
    delete: vi.fn(),
    findByOrgAndAddon: vi.fn(),
    findByOrgId: vi.fn(),
    findByTenantId: vi.fn(),
    isActiveForTenant: vi.fn(),
    upsert: vi.fn(),
  };
}

export function fakePost(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    boardId: faker.number.int({ min: 1, max: 100 }),
    postStatusId: null,
    tenantId: 1,
    userId: faker.string.uuid(),
    anonymousId: null,
    slug: faker.lorem.slug(),
    createdAt: new Date(),
    updatedAt: new Date(),
    editedAt: null,
    editedById: null,
    approvalStatus: "APPROVED" as const,
    tags: [],
    ...overrides,
  };
}

export function fakeBoard(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    tenantId: 1,
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    order: 0,
    slug: faker.lorem.slug(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeTenant(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    organizationId: faker.number.int({ min: 1, max: 10000 }),
    customDomain: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeOrganization(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    name: faker.company.name(),
    slug: faker.lorem.slug(),
    plan: "BASE" as const,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    payAsYouWantCents: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeOrgMember(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    organizationId: faker.number.int({ min: 1, max: 10000 }),
    userId: faker.string.uuid(),
    role: "MEMBER" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeTenantSettings(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    tenantId: 1,
    name: faker.company.name(),
    subdomain: faker.lorem.slug(),
    locale: "fr" as const,
    ...overrides,
  };
}

export function fakeComment(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    postId: faker.number.int({ min: 1, max: 100 }),
    userId: faker.string.uuid(),
    parentId: null,
    isPostUpdate: false,
    tenantId: 1,
    body: faker.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeLike(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    postId: faker.number.int({ min: 1, max: 100 }),
    tenantId: 1,
    userId: faker.string.uuid(),
    anonymousId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakePostStatus(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    tenantId: 1,
    name: faker.lorem.word(),
    color: "blueFrance",
    order: 0,
    showInRoadmap: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeInvitation(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    tenantId: 1,
    email: faker.internet.email(),
    tokenDigest: faker.string.hexadecimal({ length: 64 }),
    role: "USER" as const,
    acceptedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeIntegration(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    tenantId: 1,
    type: "NOTION" as const,
    name: faker.lorem.words(2),
    config: {
      apiKey: "encrypted:key",
      databaseId: faker.string.uuid(),
      databaseName: "Test DB",
      propertyMapping: { title: "Name" },
      statusMapping: {},
      boardMapping: { "opt-1": { localId: 1, remoteName: "Board" } },
      syncDirection: "outbound" as const,
    },
    enabled: true,
    lastSyncAt: null,
    syncIntervalMinutes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeIntegrationMapping(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    integrationId: 1,
    localType: "post",
    localId: faker.number.int({ min: 1, max: 10000 }),
    remoteId: faker.string.uuid(),
    remoteUrl: `https://www.notion.so/${faker.string.alphanumeric(32)}`,
    syncStatus: "SYNCED" as const,
    lastSyncAt: new Date(),
    lastError: null,
    metadata: { direction: "outbound" },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeSyncLog(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    integrationId: 1,
    mappingId: null,
    direction: "OUTBOUND" as const,
    status: "SUCCESS" as const,
    message: null,
    details: null,
    createdAt: new Date(),
    ...overrides,
  };
}
