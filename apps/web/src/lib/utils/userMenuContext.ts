import "server-only";
import { type Session } from "next-auth";

import { config } from "@/config";
import { orgMemberRepo, userOnTenantRepo } from "@/lib/repo";
import { type OrgMenuGroup, type TenantMenuItem, type UserMenuData } from "@/ui/AdminSidebar";

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

  const [orgMemberships, tenantMemberships] = await Promise.all([
    orgMemberRepo.findByUserIdWithOrgsAndTenants(userId),
    userOnTenantRepo.findByUserIdWithSettings(userId),
  ]);

  // Build a set of tenant IDs the user is a member of, with their roles
  const tenantRoleMap = new Map(tenantMemberships.map(m => [m.tenantId, m.role]));

  const organizations: OrgMenuGroup[] = orgMemberships.map(om => {
    const org = om.organization;
    const isOrgAdmin = om.role === "ADMIN" || om.role === "OWNER";

    const tenants: TenantMenuItem[] = org.tenants
      .filter(t => {
        // Show all tenants if org admin, public tenants for all org members, private only if member
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

  return {
    user: {
      email: session.user.email ?? "",
      name: session.user.name ?? session.user.email ?? "",
    },
    organizations,
    currentTenantId,
    isSuperAdmin: session.user.isSuperAdmin ?? false,
  };
}
