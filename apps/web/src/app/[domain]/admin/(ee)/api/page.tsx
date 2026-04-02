import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { DomainPageHOP } from "@/lib/DomainPage";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { apiKeyRepo } from "@/lib/repo";
import { ListApiKeysForTenant } from "@/useCases/ee/api_keys/ListApiKeysForTenant";

import { ApiKeysList } from "./ApiKeysList";

const ApiAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const t = await getTranslations("domainAdmin.api");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.API_KEYS}>
        <ApiKeysContent tenantId={tenant.id} />
      </EntitlementGate>
    </>
  );
});

const ApiKeysContent = async ({ tenantId }: { tenantId: number }) => {
  const useCase = new ListApiKeysForTenant(apiKeyRepo);
  const apiKeys = await useCase.execute({ tenantId });
  return <ApiKeysList apiKeys={apiKeys} />;
};

export default ApiAdminPage;
