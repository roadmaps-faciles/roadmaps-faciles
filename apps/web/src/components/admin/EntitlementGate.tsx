import { Button } from "@roadmaps-faciles/ui";
import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import { type ReactNode } from "react";

import { config } from "@/config";
import { hasEntitlement } from "@/lib/ee/entitlements";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { type AddonType } from "@/lib/model/Organization";
import { organizationRepo } from "@/lib/repo";

interface EntitlementGateProps {
  addon: AddonType;
  children: ReactNode;
  tenantId: number;
}

export const EntitlementGate = async ({ tenantId, addon, children }: EntitlementGateProps) => {
  const entitled = await hasEntitlement(tenantId, addon);
  if (entitled) return <>{children}</>;

  const t = await getTranslations("entitlementGate");

  // Self-host mode: show license-specific CTA
  if (config.licenseKey) {
    const status = await getLicenseStatus();

    if (status.mode === "community" || (status.mode === "licensed" && !status.valid)) {
      const isExpired = status.mode === "licensed" && !status.valid;
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Lock className="mb-4 size-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{isExpired ? t("expiredTitle") : t("selfHostTitle")}</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            {isExpired ? t("expiredDescription") : t("selfHostDescription")}
          </p>
          <Button className="mt-6" asChild>
            <Link href={config.licensingServerUrl} target="_blank" rel="noopener noreferrer">
              {isExpired ? t("renewLicense") : t("buyLicense")}
            </Link>
          </Button>
        </div>
      );
    }
  }

  // Cloud mode: link to addons page
  const org = await organizationRepo.findByTenantId(tenantId);

  // Build root-host URL — this component renders on tenant subdomains where /upgrade doesn't exist
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || new URL(config.host).host;
  const protocol = hdrs.get("x-forwarded-proto") || new URL(config.host).protocol.replace(":", "");
  const rootHost = host.replace(/^[^.]+\./, "");
  const upgradePath = org ? `/org/${org.slug}/addons` : "/upgrade";
  const upgradeUrl = `${protocol}://${rootHost}${upgradePath}`;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <Lock className="mb-4 size-10 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{t("description")}</p>
      <Button className="mt-6" asChild>
        <Link href={upgradeUrl}>{t("upgradeAction")}</Link>
      </Button>
    </div>
  );
};
