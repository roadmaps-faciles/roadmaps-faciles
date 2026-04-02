import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { appSettingsRepo } from "@/lib/repo";

import { SecurityForm } from "./SecurityForm";

const AdminSecurityPage = async () => {
  await connection();
  const [appSettings, t] = await Promise.all([appSettingsRepo.get(), getTranslations("rootAdmin.security")]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SecurityForm force2FA={appSettings.force2FA} force2FAGraceDays={appSettings.force2FAGraceDays} />
    </>
  );
};

export default AdminSecurityPage;
