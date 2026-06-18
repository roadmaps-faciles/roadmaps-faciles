import { prisma } from "@/lib/db/prisma";
import { type Prisma, type Tenant, type TenantSettings } from "@/prisma/client";

import { type ITenantRepo, type TenantWithSettingsAndMemberCount } from "../ITenantRepo";

export class TenantRepoPrisma implements ITenantRepo {
  public countByOrganizationId(organizationId: number): Promise<number> {
    return prisma.tenant.count({
      where: { organizationId, deletedAt: null },
    });
  }

  public findAll(): Promise<Tenant[]> {
    return prisma.tenant.findMany();
  }

  public findAllWithSettings(): Promise<TenantWithSettingsAndMemberCount[]> {
    return prisma.tenant.findMany({
      where: { deletedAt: null, settings: { isNot: null } },
      include: {
        settings: true,
        members: {
          where: { role: "OWNER" },
          select: { user: { select: { email: true, name: true } } },
        },
        _count: { select: { members: true } },
      },
    }) as Promise<TenantWithSettingsAndMemberCount[]>;
  }

  public async findById(id: number): Promise<null | Tenant> {
    const ret = await prisma.tenant.findUnique({
      where: { id },
    });

    return ret;
  }

  public async findByIdWithSettings(id: number): Promise<({ settings: null | TenantSettings } & Tenant) | null> {
    const ret = await prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    return ret;
  }

  public findBySubdomain(subdomain: string): Promise<null | Tenant> {
    return prisma.tenant.findFirst({
      where: {
        settings: {
          subdomain,
        },
      },
    });
  }

  public findByCustomDomain(customDomain: string): Promise<null | Tenant> {
    return prisma.tenant.findFirst({
      where: {
        settings: {
          customDomain,
        },
      },
    });
  }

  public create(data: Prisma.TenantUncheckedCreateInput): Promise<Tenant> {
    return prisma.tenant.create({ data });
  }

  public async findAllForUser(userId: string): Promise<Tenant[]> {
    const links = await prisma.userOnTenant.findMany({
      where: { userId },
      include: {
        tenant: {
          include: {
            settings: true,
          },
        },
      },
    });

    return links.map(link => link.tenant);
  }

  public update<
    WithSetting extends boolean = false,
    R extends WithSetting extends true ? TenantWithSettings : Tenant = WithSetting extends true
      ? TenantWithSettings
      : Tenant,
  >(id: number, data: Prisma.TenantUncheckedUpdateInput, withSetting = false as WithSetting): Promise<R> {
    return prisma.tenant.update({
      where: { id },
      data,
      include: {
        settings: withSetting,
      },
    }) as Promise<R>;
  }
}
type TenantWithSettings = { settings: null | TenantSettings } & Tenant;
