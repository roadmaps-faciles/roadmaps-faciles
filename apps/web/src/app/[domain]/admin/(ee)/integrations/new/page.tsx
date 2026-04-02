import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { DomainPageHOP } from "@/lib/DomainPage";
import { assertFeature } from "@/lib/feature-flags";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auth } from "@/lib/next-auth/auth";
import { boardRepo, postStatusRepo } from "@/lib/repo";

import { NotionWizard } from "./NotionWizard";

const NewIntegrationPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  await assertFeature("integrations", await auth());
  const [boards, statuses, t] = await Promise.all([
    boardRepo.findAllForTenant(tenant.id),
    postStatusRepo.findAllForTenant(tenant.id),
    getTranslations("domainAdmin.integrations"),
  ]);

  return (
    <>
      <AdminPageHeader title={t("newTitle")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.INTEGRATIONS}>
        <NotionWizard boards={boards} statuses={statuses} />
      </EntitlementGate>
    </>
  );
});

export default NewIntegrationPage;
