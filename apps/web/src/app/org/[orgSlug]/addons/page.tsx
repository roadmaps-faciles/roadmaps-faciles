import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { getAllPackPricing } from "@/lib/ee/billing/pricing";
import { getActiveSubscription } from "@/lib/ee/billing/subscription-details";
import { auth } from "@/lib/next-auth/auth";
import { orgAddonRepo, orgMemberRepo, organizationRepo } from "@/lib/repo";

import { OrgAddonsList } from "./OrgAddonsList";

const OrgAddonsPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  if (await isSelfHost()) notFound();
  const { orgSlug } = await params;
  const [org, session, t] = await Promise.all([
    organizationRepo.findBySlug(orgSlug),
    auth(),
    getTranslations("orgAdmin.addons"),
  ]);
  if (!org) notFound();

  const membership = session?.user.uuid ? await orgMemberRepo.findByOrgAndUser(org.id, session.user.uuid) : null;
  const canEdit = session?.user.isSuperAdmin || membership?.role === "ADMIN" || membership?.role === "OWNER";
  const useStripeCheckout = config.env === "dev" ? (await cookies()).get("dev-use-stripe")?.value === "1" : true;

  const [addons, tenants, addonPricing, subscription] = await Promise.all([
    orgAddonRepo.findByOrgId(org.id),
    prisma.tenant.findMany({
      where: { organizationId: org.id, deletedAt: null },
      include: { settings: true },
    }),
    getAllPackPricing(),
    getActiveSubscription(org.stripeCustomerId),
  ]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <OrgAddonsList
        addons={addons}
        orgId={org.id}
        orgSlug={orgSlug}
        plan={org.plan}
        addonPricing={addonPricing}
        billingInterval={subscription?.interval ?? "monthly"}
        hasSubscription={!!subscription}
        canEdit={canEdit}
        useStripeCheckout={useStripeCheckout}
        tenants={tenants.map(t => ({ id: t.id, name: t.settings?.name ?? `Tenant #${t.id}` }))}
      />
    </>
  );
};

export default OrgAddonsPage;
