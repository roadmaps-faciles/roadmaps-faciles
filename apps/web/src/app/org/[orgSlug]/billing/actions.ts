"use server";

import { revalidatePath } from "next/cache";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { assertCloud } from "@/lib/deployment";
import { createPortalSession } from "@/lib/ee/billing/checkout";
import { getPackStripePriceIds } from "@/lib/ee/billing/pricing";
import { getAllActiveSubscriptions } from "@/lib/ee/billing/subscription-details";
import { cancelSubscription, setPayAsYouWant } from "@/lib/ee/billing/subscriptions";
import { ALL_PURCHASABLE_IDS, resolveAddonsForPurchase } from "@/lib/model/Pricing";
import { organizationRepo } from "@/lib/repo";
import { AuditAction, audit, getRequestContext } from "@/utils/audit";
import { assertOrgOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const openPortal = async (orgSlug: string): Promise<ServerActionResponse<{ url: string }>> => {
  await assertCloud();
  const reqCtx = await getRequestContext();

  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) return { ok: false, error: "Organization not found" };

  const session = await assertOrgOwner(org.id);

  try {
    const returnUrl = `${config.host}/org/${orgSlug}/billing`;
    const portalSession = await createPortalSession(org, returnUrl);

    audit(
      {
        action: AuditAction.ORG_PORTAL_SESSION_CREATED,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(org.id),
        metadata: { orgSlug: org.slug },
      },
      reqCtx,
    );

    return { ok: true, data: { url: portalSession.url } };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_PORTAL_SESSION_CREATED,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const cancelOrgSubscription = async (orgSlug: string): Promise<ServerActionResponse> => {
  await assertCloud();
  const reqCtx = await getRequestContext();

  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) return { ok: false, error: "Organization not found" };

  const session = await assertOrgOwner(org.id);

  try {
    await cancelSubscription(org);

    audit(
      {
        action: AuditAction.ORG_SUBSCRIPTION_CANCELLED,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(org.id),
        metadata: { orgSlug: org.slug },
      },
      reqCtx,
    );

    revalidatePath(`/org/${orgSlug}/billing`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_SUBSCRIPTION_CANCELLED,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const updatePayAsYouWant = async (orgSlug: string, amountCents: number): Promise<ServerActionResponse> => {
  await assertCloud();
  const reqCtx = await getRequestContext();

  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) return { ok: false, error: "Organization not found" };

  const session = await assertOrgOwner(org.id);

  if (org.plan !== "GRANTED_FREE" && org.plan !== "GOV") {
    audit(
      {
        action: AuditAction.ORG_PAYW_UPDATED,
        success: false,
        error: "Invalid plan for PAYW",
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: "Pay-as-you-want is only available for GRANTED_FREE and GOV plans" };
  }

  try {
    await setPayAsYouWant(org, amountCents);

    audit(
      {
        action: AuditAction.ORG_PAYW_UPDATED,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(org.id),
        metadata: { orgSlug: org.slug, amountCents },
      },
      reqCtx,
    );

    revalidatePath(`/org/${orgSlug}/billing`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_PAYW_UPDATED,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

/**
 * Restore purchases: sync Stripe subscriptions → DB addons.
 * Stripe is the source of truth.
 */
export const restorePurchases = async (
  orgSlug: string,
): Promise<ServerActionResponse<{ activated: string[]; deactivated: string[] }>> => {
  await assertCloud();
  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) return { ok: false, error: "Organization not found" };

  const session = await assertOrgOwner(org.id);
  const reqCtx = await getRequestContext();

  if (!org.stripeCustomerId) return { ok: false, error: "No Stripe customer linked" };

  const priceToPackId = new Map<string, string>();
  for (const packId of ALL_PURCHASABLE_IDS) {
    const prices = getPackStripePriceIds(packId);
    if (prices) {
      if (prices.monthly) priceToPackId.set(prices.monthly, packId);
      if (prices.yearly) priceToPackId.set(prices.yearly, packId);
    }
  }

  const subscriptions = await getAllActiveSubscriptions(org.stripeCustomerId);

  const stripeAddons = new Map<string, "MONTHLY" | "YEARLY">();
  for (const sub of subscriptions) {
    const interval = sub.interval === "yearly" ? ("YEARLY" as const) : ("MONTHLY" as const);
    for (const item of sub.items) {
      const packId = priceToPackId.get(item.priceId);
      if (packId) {
        for (const addon of resolveAddonsForPurchase(packId)) {
          stripeAddons.set(addon, interval);
        }
      }
    }
  }

  const dbAddons = await prisma.orgAddon.findMany({
    where: { organizationId: org.id, tenantId: null },
  });

  const activated: string[] = [];
  const deactivated: string[] = [];

  for (const [addon, interval] of stripeAddons) {
    const existing = dbAddons.find(a => a.addon === addon);
    if (!existing) {
      await prisma.orgAddon.create({
        data: {
          organizationId: org.id,
          tenantId: null,
          addon: addon as never,
          active: true,
          billingInterval: interval,
        },
      });
      activated.push(addon);
    } else if (!existing.active || existing.billingInterval !== interval) {
      await prisma.orgAddon.update({
        where: { id: existing.id },
        data: { active: true, billingInterval: interval },
      });
      activated.push(addon);
    }
  }

  for (const dbAddon of dbAddons) {
    if (dbAddon.active && !stripeAddons.has(dbAddon.addon)) {
      await prisma.orgAddon.update({
        where: { id: dbAddon.id },
        data: { active: false, billingInterval: null },
      });
      deactivated.push(dbAddon.addon);
    }
  }

  audit(
    {
      action: AuditAction.ORG_SUBSCRIPTION_UPDATED,
      userId: session.user.uuid,
      targetType: "Organization",
      targetId: String(org.id),
      metadata: { orgSlug, activated, deactivated, source: "restorePurchases" },
    },
    reqCtx,
  );

  revalidatePath(`/org/${orgSlug}`);
  return { ok: true, data: { activated, deactivated } };
};
