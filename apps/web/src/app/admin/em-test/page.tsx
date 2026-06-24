import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { EmTestForm } from "./EmTestForm";

const AdminEmTestPage = async () => {
  await connection();
  const t = await getTranslations("rootAdmin.emTest");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EmTestForm />
    </>
  );
};

export default AdminEmTestPage;
