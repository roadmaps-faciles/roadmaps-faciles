import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { orgDomainRepo, organizationRepo } from "@/lib/repo";

import { OrgDomainsList } from "./OrgDomainsList";

const OrgDomainsPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  const { orgSlug } = await params;
  const [org, t] = await Promise.all([organizationRepo.findBySlug(orgSlug), getTranslations("orgAdmin.domains")]);
  if (!org) notFound();

  const domains = await orgDomainRepo.findByOrgId(org.id);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <OrgDomainsList domains={domains} orgId={org.id} />
    </>
  );
};

export default OrgDomainsPage;
