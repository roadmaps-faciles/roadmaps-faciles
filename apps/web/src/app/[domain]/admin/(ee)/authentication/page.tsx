import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { config } from "@/config";
import { DomainPageHOP } from "@/lib/DomainPage";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { tenantDefaultOAuthRepo } from "@/lib/repo";

import { AuthenticationForm } from "./AuthenticationForm";

const AuthenticationAdminPage = DomainPageHOP()(async props => {
  const { settings, tenant } = props._data;
  const t = await getTranslations("domainAdmin.authentication");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.SSO_ENTERPRISE}>
        <AuthenticationContent tenantId={tenant.id} tenantSettings={settings} />
      </EntitlementGate>
    </>
  );
});

const AuthenticationContent = async ({
  tenantId,
  tenantSettings,
}: {
  tenantId: number;
  tenantSettings: Parameters<typeof AuthenticationForm>[0]["tenantSettings"];
}) => {
  const enabledProviders = await tenantDefaultOAuthRepo.findByTenantId(tenantId);

  const availableProviders: string[] = [];
  if (config.oauth.github.clientId) availableProviders.push("github");
  if (config.oauth.google.clientId) availableProviders.push("google");
  if (config.oauth.proconnect.clientId) availableProviders.push("proconnect");

  return (
    <AuthenticationForm
      tenantSettings={tenantSettings}
      enabledProviders={enabledProviders.map(p => p.provider)}
      availableProviders={availableProviders}
    />
  );
};

export default AuthenticationAdminPage;
