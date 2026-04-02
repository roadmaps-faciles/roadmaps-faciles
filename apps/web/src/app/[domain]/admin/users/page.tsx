import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { DomainPageHOP } from "@/lib/DomainPage";
import { auth } from "@/lib/next-auth/auth";
import { userOnTenantRepo } from "@/lib/repo";
import { ListUsersForTenant } from "@/useCases/user_on_tenant/ListUsersForTenant";

import { MembersList } from "./MembersList";

const MembersAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const [session, t] = await Promise.all([auth(), getTranslations("domainAdmin.users")]);

  const useCase = new ListUsersForTenant(userOnTenantRepo);
  const members = await useCase.execute({ tenantId: tenant.id });

  const superAdminIds = members
    .filter(m => m.user.username && config.admins.includes(m.user.username))
    .map(m => m.userId);

  return (
    <>
      <AdminPageHeader title={t("members")} description={t("description")} />
      <MembersList members={members} currentUserId={session?.user.uuid ?? ""} superAdminIds={superAdminIds} />
    </>
  );
});

export default MembersAdminPage;
