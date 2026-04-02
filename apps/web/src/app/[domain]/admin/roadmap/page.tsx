import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainPageHOP } from "@/lib/DomainPage";
import { boardRepo } from "@/lib/repo";
import { ListBoardsForTenant } from "@/useCases/boards/ListBoardsForTenant";

import { RoadmapForm } from "./RoadmapForm";

const RoadmapAdminPage = DomainPageHOP()(async props => {
  const { tenant, settings } = props._data;

  const useCase = new ListBoardsForTenant(boardRepo);
  const [boards, t] = await Promise.all([
    useCase.execute({ tenantId: tenant.id }),
    getTranslations("domainAdmin.roadmap"),
  ]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <RoadmapForm boards={boards} currentRootBoardId={settings.rootBoardId} />
    </>
  );
});

export default RoadmapAdminPage;
