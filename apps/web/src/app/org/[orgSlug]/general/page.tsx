import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isSelfHost } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { type OrgPlan } from "@/lib/model/Organization";
import { auth } from "@/lib/next-auth/auth";
import { orgMemberRepo, organizationRepo } from "@/lib/repo";

import { OrgGeneralForm } from "./OrgGeneralForm";

const CLOUD_PLAN_LABEL_KEYS = {
  BASE: "planFree",
  GOV: "planGov",
  GRANTED_FREE: "planGrantedFree",
} as const satisfies Record<OrgPlan, string>;

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

  // In self-host the org "plan" column is always BASE (billing/addons is cloud-only); the real
  // entitlement comes from the license. Derive the displayed label from the license status.
  let planLabel: string;
  if (await isSelfHost()) {
    const status = await getLicenseStatus();
    planLabel =
      status.valid && status.plan === "GOV_LICENSED"
        ? t("planGovLicensed")
        : status.valid && status.plan === "LICENSED"
          ? t("planLicensed")
          : t("planCommunity");
  } else {
    planLabel = t(CLOUD_PLAN_LABEL_KEYS[org.plan]);
  }

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <OrgGeneralForm org={org} canEdit={canEdit} planLabel={planLabel} />
    </>
  );
};

export default OrgGeneralPage;
