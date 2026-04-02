import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainPageHOP } from "@/lib/DomainPage";
import { postStatusRepo } from "@/lib/repo";
import { ListPostStatuses } from "@/useCases/post_statuses/ListPostStatuses";

import { StatusesList } from "./StatusesList";

const StatusesAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const useCase = new ListPostStatuses(postStatusRepo);
  const [statuses, t] = await Promise.all([
    useCase.execute({ tenantId: tenant.id }),
    getTranslations("domainAdmin.statuses"),
  ]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <StatusesList statuses={statuses} />
    </>
  );
});

export default StatusesAdminPage;
