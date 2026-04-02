import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type BillingInterval } from "@/lib/ee/billing/checkout";
import { organizationRepo } from "@/lib/repo";
import { assertOrgAdmin } from "@/utils/auth";

import { CheckoutSummary, type CartItemInit } from "./CheckoutSummary";

/**
 * Parse cart items from URL.
 * Supports two formats:
 * - Simple: ?items=pack1,pack2&interval=monthly (all same interval)
 * - Full:   ?cart=pack1:monthly,pack2:yearly (per-item interval, used by cancel URL)
 */
function parseCartItems(sp: Record<string, string | undefined>): CartItemInit[] {
  // Full cart format (from cancel URL)
  if (sp.cart) {
    return sp.cart
      .split(",")
      .filter(Boolean)
      .map(entry => {
        const [packId, iv] = entry.split(":");
        return { packId, interval: (iv === "yearly" ? "yearly" : "monthly") as BillingInterval };
      });
  }

  // Simple format
  const items = sp.items?.split(",").filter(Boolean) ?? [];
  const interval: BillingInterval = sp.interval === "yearly" ? "yearly" : "monthly";
  return items.map(packId => ({ packId, interval }));
}

const CheckoutPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) => {
  await connection();
  const { orgSlug } = await params;
  const sp = await searchParams;

  const [org, t] = await Promise.all([organizationRepo.findBySlug(orgSlug), getTranslations("orgAdmin.checkout")]);
  if (!org) notFound();

  await assertOrgAdmin(org.id);

  const cartItems = parseCartItems(sp);
  const autopay = sp.autopay === "1";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <AdminPageHeader
        title={autopay ? t("processingNext") : t("title")}
        description={autopay ? t("processingNextDesc") : t("subtitle")}
      />
      <CheckoutSummary cartInit={cartItems} orgSlug={orgSlug} autopay={autopay} />
    </div>
  );
};

export default CheckoutPage;
