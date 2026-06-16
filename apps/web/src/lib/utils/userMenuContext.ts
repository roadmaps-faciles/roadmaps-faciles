import "server-only";
import { type Session } from "next-auth";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { orgMemberRepo, organizationRepo, tenantRepo, userOnTenantRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import {
  type CurrentTenantContext,
  type OrgMenuGroup,
  type TenantMenuItem,
  type UserMenuData,
} from "@/ui/AdminSidebar";

interface UserMenuContextOptions {
  /** Current org context (e.g. in org admin or tenant admin) */
  currentOrgId?: number;
  /** Current tenant context (e.g. in tenant admin) */
  currentTenantId?: number;
  session: Session;
}

/**
 * Fetch user context for the user menu (sidebar footer + header dropdowns).
 * Returns a grouped `UserMenuData` with organizations → tenants tree.
 */
export async function getUserMenuContext({ session, currentTenantId }: UserMenuContextOptions): Promise<UserMenuData> {
  if (!session?.user?.uuid) {
    return {
      user: { email: "", name: "" },
      organizations: [],
      currentTenantId,
    };
  }

  const userId = session.user.uuid;
  const hostUrl = new URL(config.host).host;
  const isSuperAdmin = session.user.isSuperAdmin ?? false;
  // /admin (root admin) is gated by assertAdmin = global role >= ADMIN OR super admin.
  // The link must mirror that, not isSuperAdmin alone (self-host bootstrap admin is
  // role ADMIN but not in the ADMINS allowlist that drives isSuperAdmin).
  const isGlobalAdmin = isSuperAdmin || session.user.role === UserRole.ADMIN || session.user.role === UserRole.OWNER;

  const [orgMemberships, tenantMemberships] = await Promise.all([
    orgMemberRepo.findByUserIdWithOrgsAndTenants(userId),
    userOnTenantRepo.findByUserIdWithSettings(userId),
  ]);

  const tenantRoleMap = new Map(tenantMemberships.map(m => [m.tenantId, m.role]));

  let organizations: OrgMenuGroup[];

  if (isSuperAdmin) {
    const allOrgs = await prisma.organization.findMany({
      include: { tenants: { include: { settings: true } } },
      orderBy: { name: "asc" },
    });

    organizations = allOrgs.map(org => {
      const tenants: TenantMenuItem[] = org.tenants.map(t => {
        const tenantRole = tenantRoleMap.get(t.id);

        return {
          id: t.id,
          name: t.settings?.name ?? t.id.toString(),
          subdomain: t.settings?.subdomain ?? "",
          href: `//${t.settings?.subdomain}.${hostUrl}`,
          role: tenantRole ?? "OWNER",
          isMember: true,
          isPrivate: t.settings?.isPrivate ?? false,
          tenantAdminHref: `//${t.settings?.subdomain}.${hostUrl}/admin`,
        };
      });

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: "OWNER",
        orgAdminHref: `//${hostUrl}/org/${org.slug}`,
        tenants,
      };
    });
  } else {
    organizations = orgMemberships.map(om => {
      const org = om.organization;
      const isOrgAdmin = om.role === "ADMIN" || om.role === "OWNER";

      const tenants: TenantMenuItem[] = org.tenants
        .filter(t => {
          if (isOrgAdmin) return true;
          if (tenantRoleMap.has(t.id)) return true;
          return !t.settings?.isPrivate;
        })
        .map(t => {
          const tenantRole = tenantRoleMap.get(t.id);
          const isMember = tenantRoleMap.has(t.id);
          const isTenantAdmin = tenantRole === "ADMIN" || tenantRole === "OWNER";

          return {
            id: t.id,
            name: t.settings?.name ?? t.id.toString(),
            subdomain: t.settings?.subdomain ?? "",
            href: `//${t.settings?.subdomain}.${hostUrl}`,
            role: tenantRole,
            isMember,
            isPrivate: t.settings?.isPrivate ?? false,
            tenantAdminHref: isTenantAdmin ? `//${t.settings?.subdomain}.${hostUrl}/admin` : undefined,
          };
        });

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: om.role,
        orgAdminHref: isOrgAdmin ? `//${hostUrl}/org/${org.slug}` : undefined,
        tenants,
      };
    });
  }

  let currentTenant: CurrentTenantContext | undefined;
  if (currentTenantId) {
    for (const org of organizations) {
      const tenant = org.tenants.find(t => t.id === currentTenantId);
      if (tenant) {
        currentTenant = {
          name: tenant.name,
          adminHref: tenant.tenantAdminHref,
          org: { name: org.name, adminHref: org.orgAdminHref },
        };
        break;
      }
    }

    // Fallback for super admins who may not have org membership
    if (!currentTenant && session.user.isSuperAdmin) {
      const tenantWithSettings = await tenantRepo.findByIdWithSettings(currentTenantId);
      if (tenantWithSettings?.settings) {
        const org = await organizationRepo.findById(tenantWithSettings.organizationId);
        currentTenant = {
          name: tenantWithSettings.settings.name ?? currentTenantId.toString(),
          adminHref: `//${tenantWithSettings.settings.subdomain}.${hostUrl}/admin`,
          org: {
            name: org?.name ?? "",
            adminHref: org ? `//${hostUrl}/org/${org.slug}` : undefined,
          },
        };
      }
    }
  }

  return {
    user: {
      email: session.user.email ?? "",
      image: session.user.image,
      name: session.user.name ?? session.user.email ?? "",
    },
    organizations,
    currentTenantId,
    currentTenant,
    isSuperAdmin: session.user.isSuperAdmin ?? false,
    isGlobalAdmin,
  };
}
