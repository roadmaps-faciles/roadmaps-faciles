import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const OrgSecurityPage = async () => {
  await connection();
  const t = await getTranslations("orgAdmin.security");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <p className="text-muted-foreground">{t("comingSoon")}</p>
    </>
  );
};

export default OrgSecurityPage;
