import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { auth } from "@/lib/next-auth/auth";
import { orgMemberRepo, organizationRepo } from "@/lib/repo";

import { OrgMembersList } from "./OrgMembersList";

const OrgMembersPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  const { orgSlug } = await params;
  const [org, session, t] = await Promise.all([
    organizationRepo.findBySlug(orgSlug),
    auth(),
    getTranslations("orgAdmin.members"),
  ]);
  if (!org) notFound();

  const members = await orgMemberRepo.findByOrgId(org.id);
  const currentMembership = members.find(m => m.userId === session?.user.uuid);
  const isOwner = session?.user.isSuperAdmin || currentMembership?.role === "OWNER";

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <OrgMembersList members={members} orgId={org.id} isOwner={isOwner} />
    </>
  );
};

export default OrgMembersPage;
