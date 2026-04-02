import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { auth } from "@/lib/next-auth/auth";
import { orgMemberRepo, organizationRepo } from "@/lib/repo";

import { OrgGeneralForm } from "./OrgGeneralForm";

const OrgGeneralPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  const { orgSlug } = await params;
  const [org, session, t] = await Promise.all([
    organizationRepo.findBySlug(orgSlug),
    auth(),
    getTranslations("orgAdmin.general"),
  ]);
  if (!org) notFound();

  const membership = session?.user.uuid ? await orgMemberRepo.findByOrgAndUser(org.id, session.user.uuid) : null;
  const canEdit = session?.user.isSuperAdmin || membership?.role === "OWNER";

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <OrgGeneralForm org={org} canEdit={canEdit} />
    </>
  );
};

export default OrgGeneralPage;
