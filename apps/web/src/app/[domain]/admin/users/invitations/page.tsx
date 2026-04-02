import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainPageHOP } from "@/lib/DomainPage";
import { auth } from "@/lib/next-auth/auth";
import { invitationRepo, userOnTenantRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import { ListInvitationsForTenant } from "@/useCases/invitations/ListInvitationsForTenant";

import { InvitationsList } from "./InvitationsList";

const InvitationsAdminPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const useCase = new ListInvitationsForTenant(invitationRepo);
  const [invitations, session, t] = await Promise.all([
    useCase.execute({ tenantId: tenant.id }),
    auth(),
    getTranslations("domainAdmin.invitations"),
  ]);

  let isOwner = false;
  if (session?.user) {
    if (session.user.isSuperAdmin) {
      isOwner = true;
    } else {
      const membership = await userOnTenantRepo.findMembership(session.user.uuid, tenant.id);
      isOwner = membership?.role === UserRole.OWNER;
    }
  }

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <InvitationsList invitations={invitations} isOwner={isOwner} />
    </>
  );
});

export default InvitationsAdminPage;
