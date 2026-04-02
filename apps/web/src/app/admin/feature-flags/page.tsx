import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getFeatureFlags } from "@/lib/feature-flags";

import { FeatureFlagsForm } from "./FeatureFlagsForm";

const AdminFeatureFlagsPage = async () => {
  await connection();
  const [flags, t] = await Promise.all([getFeatureFlags(), getTranslations("rootAdmin.featureFlags")]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <FeatureFlagsForm flags={flags} />
    </>
  );
};

export default AdminFeatureFlagsPage;
