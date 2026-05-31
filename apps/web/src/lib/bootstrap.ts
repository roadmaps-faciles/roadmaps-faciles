import argon2 from "argon2";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { ORG_PLAN, ORG_ROLE } from "@/lib/model/Organization";
import { UserRole, UserStatus } from "@/prisma/enums";
import { CreateWelcomeEntitiesWorkflow } from "@/workflows/CreateWelcomeEntitiesWorkflow";

export interface BootstrapOptions {
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
  adminUsername?: string;
  tenantName?: string;
  tenantSubdomain?: string;
}

export interface BootstrapResult {
  adminEmail: string;
  alreadyInitialized: boolean;
  tenantId?: number;
}

export async function createMinimalInstance(opts: BootstrapOptions = {}): Promise<BootstrapResult> {
  const existing = await prisma.tenant.count();
  if (existing > 0) {
    return { adminEmail: "", alreadyInitialized: true };
  }

  const tenantName = opts.tenantName ?? config.seed.tenantName;
  const tenantSubdomain = opts.tenantSubdomain ?? config.seed.tenantSubdomain;
  const adminName = opts.adminName ?? config.seed.adminName;
  const adminEmail = opts.adminEmail ?? config.seed.adminEmail;
  const adminUsername = opts.adminUsername ?? config.seed.adminUsername;
  const adminPassword = opts.adminPassword ?? config.seed.adminPassword;

  const organization = await prisma.organization.create({
    data: { name: tenantName, slug: tenantSubdomain, plan: ORG_PLAN.BASE },
  });

  const tenant = await prisma.tenant.create({ data: { organizationId: organization.id } });

  await prisma.tenantSettings.create({
    data: { tenantId: tenant.id, name: tenantName, subdomain: tenantSubdomain, customDomain: null },
  });

  // argon2 directement, pas `hashPassword` : son `import "server-only"` casse sous tsx/node (seed).
  const passwordHash = adminPassword ? await argon2.hash(adminPassword) : null;

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      emailVerified: new Date(),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      username: adminUsername,
      image: config.seed.adminImage || null,
      ...(passwordHash && { passwordHash }),
    },
  });

  await prisma.userOnTenant.create({
    data: { userId: admin.id, tenantId: tenant.id, role: UserRole.OWNER, status: UserStatus.ACTIVE },
  });

  await prisma.orgMember.create({
    data: { organizationId: organization.id, userId: admin.id, role: ORG_ROLE.OWNER },
  });

  await prisma.appSettings.upsert({ where: { id: 0 }, create: { id: 0 }, update: {} });

  await new CreateWelcomeEntitiesWorkflow(tenant.id).run();

  return { adminEmail, alreadyInitialized: false, tenantId: tenant.id };
}
