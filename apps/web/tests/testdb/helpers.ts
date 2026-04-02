import { faker } from "@faker-js/faker";

import { prisma } from "@/lib/db/prisma";
import { type Prisma } from "@/prisma/client";

export async function createTestUser(overrides: Partial<Prisma.UserUncheckedCreateInput> = {}) {
  const defaults: Prisma.UserUncheckedCreateInput = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
  };
  return prisma.user.create({ data: { ...defaults, ...overrides } });
}

export async function createTestTenant() {
  return prisma.tenant.create({ data: {} });
}

export async function createTestTenantWithSettings(
  settingsOverrides: Partial<Prisma.TenantSettingsUncheckedCreateInput> = {},
) {
  const tenant = await prisma.tenant.create({ data: {} });
  const defaults: Prisma.TenantSettingsUncheckedCreateInput = {
    tenantId: tenant.id,
    name: faker.company.name(),
    subdomain: `test-${faker.string.alphanumeric(10).toLowerCase()}`,
  };
  const settings = await prisma.tenantSettings.create({
    data: { ...defaults, ...settingsOverrides, tenantId: tenant.id },
  });
  return { tenant, settings };
}

export async function createTestBoard(tenantId: number, overrides: Partial<Prisma.BoardUncheckedCreateInput> = {}) {
  const defaults: Prisma.BoardUncheckedCreateInput = {
    name: `board-${faker.string.alphanumeric(8)}`,
    order: 0,
    tenantId,
    slug: `slug-${faker.string.alphanumeric(10).toLowerCase()}`,
  };
  return prisma.board.create({ data: { ...defaults, ...overrides, tenantId } });
}

export async function createTestPost(
  boardId: number,
  tenantId: number,
  userId: null | string,
  overrides: Partial<Prisma.PostUncheckedCreateInput> = {},
) {
  const defaults: Prisma.PostUncheckedCreateInput = {
    title: faker.lorem.sentence(),
    boardId,
    tenantId,
    userId,
    slug: `slug-${faker.string.alphanumeric(10).toLowerCase()}`,
  };
  return prisma.post.create({ data: { ...defaults, ...overrides, boardId, tenantId } });
}

export async function createTestMembership(
  userId: string,
  tenantId: number,
  overrides: Partial<Prisma.UserOnTenantUncheckedCreateInput> = {},
) {
  const defaults: Prisma.UserOnTenantUncheckedCreateInput = {
    userId,
    tenantId,
  };
  return prisma.userOnTenant.create({ data: { ...defaults, ...overrides, userId, tenantId } });
}

export async function createTestInvitation(
  tenantId: number,
  overrides: Partial<Prisma.InvitationUncheckedCreateInput> = {},
) {
  const defaults: Prisma.InvitationUncheckedCreateInput = {
    email: faker.internet.email(),
    tokenDigest: faker.string.alphanumeric(64),
    tenantId,
  };
  return prisma.invitation.create({ data: { ...defaults, ...overrides, tenantId } });
}

export async function createTestPostStatus(
  tenantId: number,
  overrides: Partial<Prisma.PostStatusUncheckedCreateInput> = {},
) {
  const defaults: Prisma.PostStatusUncheckedCreateInput = {
    name: `status-${faker.string.alphanumeric(8)}`,
    color: "blueFrance",
    order: 0,
    tenantId,
  };
  return prisma.postStatus.create({ data: { ...defaults, ...overrides, tenantId } });
}

export async function createTestAuditLog(overrides: Partial<Prisma.AuditLogCreateInput> = {}) {
  const defaults: Prisma.AuditLogCreateInput = {
    action: "POST_CREATE",
  };
  return prisma.auditLog.create({ data: { ...defaults, ...overrides } });
}
