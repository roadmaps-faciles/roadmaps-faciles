import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { getDeploymentMode } from "@/lib/deployment";
import { devOverrides } from "@/lib/devOverride";
import { getOrCreateInstanceId } from "@/lib/ee/licensing/instanceId";

import { LicensingDevSection } from "./LicensingDevSection";
import { StripeDevSection } from "./StripeDevSection";

const DevToolsPage = async () => {
  if (config.env !== "dev") notFound();
  await connection();

  const [t, instanceId, deploymentMode] = await Promise.all([
    getTranslations("rootAdmin.devTools"),
    getOrCreateInstanceId(),
    getDeploymentMode(),
  ]);

  const hasOverride = !!devOverrides.licenseKey;
  const hasEnvKey = !!config.licenseKey;
  const initialOffline = devOverrides.licenseOffline ?? false;
  const initialUseStripe = devOverrides.useStripe ?? false;

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
