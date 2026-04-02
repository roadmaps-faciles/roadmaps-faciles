import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { getRootOAuthProviders } from "@/lib/utils/rootOAuthProviders";

import { RootAuthenticationForm } from "./RootAuthenticationForm";

const AdminAuthenticationPage = async () => {
  await connection();
  const [rootProviders, t] = await Promise.all([getRootOAuthProviders(), getTranslations("rootAdmin.authentication")]);

  const providers = [
    { key: "github" as const, label: t("github"), configured: !!config.oauth.github.clientId },
    { key: "google" as const, label: t("google"), configured: !!config.oauth.google.clientId },
    { key: "proconnect" as const, label: t("proconnect"), configured: !!config.oauth.proconnect.clientId },
  ];

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />

      <div className="max-w-lg">
        <RootAuthenticationForm providers={providers} initialValues={{ ...rootProviders }} />
      </div>
    </>
  );
};

export default AdminAuthenticationPage;
