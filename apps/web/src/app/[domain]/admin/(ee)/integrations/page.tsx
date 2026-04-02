import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { DomainPageHOP } from "@/lib/DomainPage";
import { assertFeature } from "@/lib/feature-flags";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auth } from "@/lib/next-auth/auth";
import { integrationRepo } from "@/lib/repo";
import { ListIntegrationsForTenant } from "@/useCases/ee/integrations/ListIntegrationsForTenant";

import { IntegrationsList } from "./IntegrationsList";

const IntegrationsAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  await assertFeature("integrations", await auth());
  const t = await getTranslations("domainAdmin.integrations");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.INTEGRATIONS}>
        <IntegrationsContent tenantId={tenant.id} />
      </EntitlementGate>
    </>
  );
});

const IntegrationsContent = async ({ tenantId }: { tenantId: number }) => {
  const useCase = new ListIntegrationsForTenant(integrationRepo);
  const integrations = await useCase.execute({ tenantId });
  return <IntegrationsList integrations={integrations} />;
};

export default IntegrationsAdminPage;
