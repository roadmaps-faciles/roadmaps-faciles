import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isCloud } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";

import { HeaderActions } from "./HeaderActions";
import { LicensingTabsClient } from "./LicensingTabsClient";
import { StatusInfoCard } from "./StatusInfoCard";

const AdminLicensingPage = async () => {
  await connection();
  const [status, t, cloud] = await Promise.all([getLicenseStatus(), getTranslations("rootAdmin.licensing"), isCloud()]);

  const statusContent = <StatusInfoCard status={status} isCloud={cloud} />;

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={<HeaderActions showRefresh={!cloud && status.mode === "licensed"} showVerify={cloud} />}
      />

      {cloud ? <LicensingTabsClient statusContent={statusContent} /> : statusContent}
    </>
  );
};

export default AdminLicensingPage;
