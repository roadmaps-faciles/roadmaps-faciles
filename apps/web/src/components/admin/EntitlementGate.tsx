import { Button } from "@roadmaps-faciles/ui";
import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import { type ReactNode } from "react";

import { config } from "@/config";
import { isSelfHost } from "@/lib/deployment";
import { hasEntitlement } from "@/lib/ee/entitlements";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { ADDON_TYPE, type AddonType } from "@/lib/model/Organization";
import { USER_ROLE } from "@/lib/model/User";
import { auth } from "@/lib/next-auth/auth";
import { orgMemberRepo, organizationRepo } from "@/lib/repo";

interface EntitlementGateProps {
  addon: AddonType;
  children: ReactNode;
  tenantId: number;
}

const GateShell = ({ action, description, title }: { action?: ReactNode; description: string; title: string }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
    <Lock className="mb-4 size-10 text-muted-foreground" />
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const EntitlementGate = async ({ tenantId, addon, children }: EntitlementGateProps) => {
  const entitled = await hasEntitlement(tenantId, addon);
  if (entitled) return <>{children}</>;

  const [t, org, session] = await Promise.all([
    getTranslations("entitlementGate"),
    organizationRepo.findByTenantId(tenantId),
    auth(),
  ]);
  const isSuperAdmin = session?.user.isSuperAdmin ?? false;
  // Instance admin = whoever can reach /admin (global role >= ADMIN OR super admin). NOT the super-admin
  // allowlist alone: the self-host bootstrap admin is a global OWNER but not in config.admins.
  const isInstanceAdmin =
    isSuperAdmin || session?.user.role === USER_ROLE.ADMIN || session?.user.role === USER_ROLE.OWNER;

  // Self-host: the instance license is the ceiling; the instance admin enables addons per org. Gate by
  // instance-admin (not org role) and never point at the cloud /addons CTA (404 here).
  if (await isSelfHost()) {
    const status = await getLicenseStatus();
    const isExpired = status.mode === "licensed" && !status.valid;
    const isCommunity = status.mode === "community";
    const licenseCovers = status.valid && (addon !== ADDON_TYPE.THEME_DSFR || status.plan === "GOV_LICENSED");

    // 1) The instance license doesn't cover this addon -> needs a (higher) license (instance-level).
    if (!licenseCovers) {
      if (!isInstanceAdmin) {
        return <GateShell title={t("title")} description={t("contactInstanceAdminLicense")} />;
      }
      return (
        <GateShell
          title={isExpired ? t("expiredTitle") : isCommunity ? t("selfHostTitle") : t("selfHostHigherTier")}
          description={
            isExpired
              ? t("expiredDescription")
              : isCommunity
                ? t("selfHostDescription")
                : t("selfHostHigherTierDescription")
          }
          action={
            <Button asChild>
              <Link href={config.licensingServerUrl} target="_blank" rel="noopener noreferrer">
                {isExpired ? t("renewLicense") : isCommunity ? t("buyLicense") : t("upgradeLicense")}
              </Link>
            </Button>
          }
        />
      );
    }

    // 2) Covered by the license but not enabled for this org -> per-org override (instance admin acts).
    if (!isInstanceAdmin) {
      return <GateShell title={t("title")} description={t("contactInstanceAdminAddon")} />;
    }
    return (
      <GateShell
        title={t("enableForOrgTitle")}
        description={t("enableForOrgDescription")}
        action={
          <Button asChild>
            <Link href={org ? `${config.host}/admin/organizations/${org.id}` : `${config.host}/admin/organizations`}>
              {t("manageOrgAddons")}
            </Link>
          </Button>
        }
      />
    );
  }

  // Cloud: org-level addon model. Buying an addon is an org-level action reserved to ADMIN/OWNER of
  // the org. A tenant admin who isn't an org member can't act on it; point them to their org admin.
  const membership = session?.user.uuid && org ? await orgMemberRepo.findByOrgAndUser(org.id, session.user.uuid) : null;
  const canManageOrg = isSuperAdmin || membership?.role === "ADMIN" || membership?.role === "OWNER";
  if (!canManageOrg) {
    return <GateShell title={t("title")} description={t("contactOrgAdmin")} />;
  }

  // Link to the addons page on the root host (this component renders on tenant subdomains).
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || new URL(config.host).host;
  const protocol = hdrs.get("x-forwarded-proto") || new URL(config.host).protocol.replace(":", "");
  const rootHost = host.replace(/^[^.]+\./, "");
  const upgradePath = org ? `/org/${org.slug}/addons` : "/upgrade";
  const upgradeUrl = `${protocol}://${rootHost}${upgradePath}`;

  return (
    <GateShell
      title={t("title")}
      description={t("description")}
      action={
        <Button asChild>
          <Link href={upgradeUrl}>{t("upgradeAction")}</Link>
        </Button>
      }
    />
  );
};
