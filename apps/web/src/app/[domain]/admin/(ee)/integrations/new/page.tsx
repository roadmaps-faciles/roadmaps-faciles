import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { DomainPageHOP } from "@/lib/DomainPage";
import { assertFeature } from "@/lib/feature-flags";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auth } from "@/lib/next-auth/auth";
import { boardRepo, postStatusRepo } from "@/lib/repo";

import { GitHubWizard } from "./GitHubWizard";
import { IntegrationTypeSelector } from "./IntegrationTypeSelector";
import { NotionWizard } from "./NotionWizard";

const NewIntegrationPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  await assertFeature("integrations", await auth());
  const searchParams = await (props as unknown as { searchParams: Promise<Record<string, string | undefined>> })
    .searchParams;
  const type = searchParams.type?.toUpperCase();
  const t = await getTranslations("domainAdmin.integrations");

  if (type === "NOTION" || type === "GITHUB") {
    const [boards, statuses] = await Promise.all([
      boardRepo.findAllForTenant(tenant.id),
      postStatusRepo.findAllForTenant(tenant.id),
    ]);

    return (
      <>
        <AdminPageHeader title={t("newTitle")} />
        <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.INTEGRATIONS}>
          {type === "NOTION" ? (
            <NotionWizard boards={boards} statuses={statuses} />
          ) : (
            <GitHubWizard boards={boards} statuses={statuses} />
          )}
        </EntitlementGate>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title={t("newTitle")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.INTEGRATIONS}>
        <IntegrationTypeSelector />
      </EntitlementGate>
    </>
  );
});

export default NewIntegrationPage;
