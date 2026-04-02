import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainPageHOP } from "@/lib/DomainPage";
import { boardRepo } from "@/lib/repo";
import { ListBoardsForTenant } from "@/useCases/boards/ListBoardsForTenant";

import { BoardsList } from "./BoardsList";

const BoardsAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const useCase = new ListBoardsForTenant(boardRepo);
  const [boards, t] = await Promise.all([
    useCase.execute({ tenantId: tenant.id }),
    getTranslations("domainAdmin.boards"),
  ]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <BoardsList boards={boards} />
    </>
  );
});

export default BoardsAdminPage;
