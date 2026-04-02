import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { DomainPageHOP } from "@/lib/DomainPage";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { webhookRepo } from "@/lib/repo";
import { ListWebhooksForTenant } from "@/useCases/ee/webhooks/ListWebhooksForTenant";

import { WebhooksList } from "./WebhooksList";

const WebhooksAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const t = await getTranslations("domainAdmin.webhooks");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.WEBHOOKS}>
        <WebhooksContent tenantId={tenant.id} />
      </EntitlementGate>
    </>
  );
});

const WebhooksContent = async ({ tenantId }: { tenantId: number }) => {
  const useCase = new ListWebhooksForTenant(webhookRepo);
  const webhooks = await useCase.execute({ tenantId });
  return <WebhooksList webhooks={webhooks} />;
};

export default WebhooksAdminPage;
