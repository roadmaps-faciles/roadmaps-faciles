import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainPageHOP } from "@/lib/DomainPage";
import { auth } from "@/lib/next-auth/auth";
import { boardRepo, postStatusRepo, userOnTenantRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";

import { GeneralForm } from "./GeneralForm";

const AdminGeneralPage = DomainPageHOP()(async props => {
  const { settings, tenant } = props._data;

  const [session, t] = await Promise.all([auth(), getTranslations("domainAdmin.general")]);
  let isOwner = false;
  if (session?.user) {
    if (session.user.isSuperAdmin) {
      isOwner = true;
    } else {
      const membership = await userOnTenantRepo.findMembership(session.user.uuid, tenant.id);
      isOwner = membership?.role === UserRole.OWNER;
    }
  }

  const boards = await boardRepo.findAllForTenant(tenant.id);
  const statuses = await postStatusRepo.findAllForTenant(tenant.id);
  const hasData = boards.length > 0 || statuses.length > 0;

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <GeneralForm tenantSettings={settings} isOwner={isOwner} hasData={hasData} />
    </>
  );
});

export default AdminGeneralPage;
