import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { listInvoices } from "@/lib/ee/billing/invoices";
import { getPackStripePriceIds } from "@/lib/ee/billing/pricing";
import { getAllActiveSubscriptions } from "@/lib/ee/billing/subscription-details";
import { ALL_PURCHASABLE_IDS, resolveAddonsForPurchase } from "@/lib/model/Pricing";
import { organizationRepo } from "@/lib/repo";

import { BillingPanel } from "./BillingPanel";

const OrgBillingPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  if (await isSelfHost()) notFound();
  const t = await getTranslations("orgAdmin.billing");
  const { orgSlug } = await params;

  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) notFound();

  const [subscriptions, invoices, dbAddons] = await Promise.all([
    getAllActiveSubscriptions(org.stripeCustomerId),
    listInvoices(org.stripeCustomerId),
    prisma.orgAddon.findMany({ where: { organizationId: org.id, tenantId: null } }),
  ]);

  // Detect desync between Stripe subscriptions and DB addons
  let hasDesync = false;
  if (org.stripeCustomerId && subscriptions.length > 0) {
    const priceToPackId = new Map<string, string>();
    for (const packId of ALL_PURCHASABLE_IDS) {
      const prices = getPackStripePriceIds(packId);
      if (prices) {
        if (prices.monthly) priceToPackId.set(prices.monthly, packId);
        if (prices.yearly) priceToPackId.set(prices.yearly, packId);
      }
    }

    const stripeAddonSet = new Set<string>();
    for (const sub of subscriptions) {
      for (const item of sub.items) {
        const packId = priceToPackId.get(item.priceId);
        if (packId) {
          for (const addon of resolveAddonsForPurchase(packId)) {
            stripeAddonSet.add(addon);
          }
        }
      }
    }

    const dbActiveSet = new Set(dbAddons.filter(a => a.active).map(a => a.addon as string));

    // Desync if Stripe has addons DB doesn't, or DB has active addons Stripe doesn't
    for (const addon of stripeAddonSet) {
      if (!dbActiveSet.has(addon)) {
        hasDesync = true;
        break;
      }
    }
    if (!hasDesync) {
      for (const addon of dbActiveSet) {
        if (!stripeAddonSet.has(addon)) {
          hasDesync = true;
          break;
        }
      }
    }
  }

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <BillingPanel
        orgSlug={orgSlug}
        plan={org.plan}
        stripeCustomerId={org.stripeCustomerId}
        payAsYouWantCents={org.payAsYouWantCents}
        subscriptions={subscriptions}
        invoices={invoices}
        hasDesync={hasDesync}
      />
    </>
  );
};

export default OrgBillingPage;
