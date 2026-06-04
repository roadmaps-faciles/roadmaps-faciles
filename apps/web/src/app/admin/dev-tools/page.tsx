import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { getDeploymentMode } from "@/lib/deployment";
import { getOrCreateInstanceId } from "@/lib/ee/licensing/instanceId";
import { DEV_LICENSE_KEY_COOKIE, DEV_LICENSE_OFFLINE_COOKIE } from "@/lib/ee/licensing/licenseService";

import { LicensingDevSection } from "./LicensingDevSection";
import { StripeDevSection } from "./StripeDevSection";

const DevToolsPage = async () => {
  if (config.env !== "dev") notFound();
  await connection();

  const [t, cookieStore, instanceId, deploymentMode] = await Promise.all([
    getTranslations("rootAdmin.devTools"),
    cookies(),
    getOrCreateInstanceId(),
    getDeploymentMode(),
  ]);

  const hasOverride = !!cookieStore.get(DEV_LICENSE_KEY_COOKIE)?.value;
  const hasEnvKey = !!config.licenseKey;
  const initialOffline = cookieStore.get(DEV_LICENSE_OFFLINE_COOKIE)?.value === "1";
  const initialUseStripe = cookieStore.get("dev-use-stripe")?.value === "1";

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6">
        <StripeDevSection initialUseStripe={initialUseStripe} />
        <LicensingDevSection
          hasOverride={hasOverride}
          hasEnvKey={hasEnvKey}
          instanceId={instanceId}
          initialOffline={initialOffline}
          initialDeploymentMode={deploymentMode}
        />
      </div>
    </>
  );
};

export default DevToolsPage;
