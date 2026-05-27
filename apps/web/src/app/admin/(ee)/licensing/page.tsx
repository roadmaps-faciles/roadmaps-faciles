import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getEffectiveLicenseKey, getLicenseStatus } from "@/lib/ee/licensing/licenseService";

import { HeaderActions } from "./HeaderActions";
import { LicensingTabsClient } from "./LicensingTabsClient";
import { StatusInfoCard } from "./StatusInfoCard";

const AdminLicensingPage = async () => {
  await connection();
  const [status, t, effectiveLicenseKey] = await Promise.all([
    getLicenseStatus(),
    getTranslations("rootAdmin.licensing"),
    getEffectiveLicenseKey(),
  ]);

  const isCloud = !effectiveLicenseKey;

  const statusContent = <StatusInfoCard status={status} isCloud={isCloud} />;

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={<HeaderActions showRefresh={!isCloud && status.mode === "licensed"} />}
      />

      {isCloud ? <LicensingTabsClient statusContent={statusContent} /> : statusContent}
    </>
  );
};

export default AdminLicensingPage;
