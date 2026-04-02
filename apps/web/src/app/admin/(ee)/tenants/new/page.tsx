import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { assertAdmin } from "@/utils/auth";

import { CreateTenantForm } from "./CreateTenantForm";

const CreateTenantPage = async () => {
  await connection();
  await assertAdmin();

  const t = await getTranslations("adminTenants");

  return (
    <>
      <AdminPageHeader title={t("create")} />
      <CreateTenantForm />
    </>
  );
};

export default CreateTenantPage;
