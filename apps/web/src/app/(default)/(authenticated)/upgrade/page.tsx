import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { isSelfHost } from "@/lib/deployment";
import { organizationRepo } from "@/lib/repo";
import { assertSession } from "@/utils/auth";

import { UpgradeForm } from "./UpgradeForm";

const UpgradePage = async ({ searchParams }: { searchParams: Promise<{ orgId?: string }> }) => {
  await connection();
  if (await isSelfHost()) notFound();
  const session = await assertSession();
  const t = await getTranslations("upgrade");
  const { orgId } = await searchParams;

  if (!orgId) notFound();

  const org = await organizationRepo.findById(Number(orgId));
  if (!org) notFound();

  // Only BASE orgs can be upgraded via this page
  if (org.plan !== "BASE") {
    redirect(`/org/${org.slug}/billing`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{t("description")}</p>
      <UpgradeForm orgId={org.id} defaultName={org.name} defaultSlug={org.slug} userId={session.user.uuid} />
    </div>
  );
};

export default UpgradePage;
