import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { auth } from "@/lib/next-auth/auth";

import { EmailTestForm } from "./EmailTestForm";

const AdminEmailTestPage = async () => {
  await connection();
  const t = await getTranslations("rootAdmin.emailTest");
  const session = await auth();
  const userEmail = session?.user.email ?? "";

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EmailTestForm userEmail={userEmail} />
    </>
  );
};

export default AdminEmailTestPage;
