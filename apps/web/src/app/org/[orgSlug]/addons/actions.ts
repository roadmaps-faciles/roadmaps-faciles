"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { config } from "@/config";
import { createPackCheckoutSession, type BillingInterval } from "@/lib/ee/billing/checkout";
import { ADDON_PACKS, BUNDLE_COMPLETE, BUNDLE_PRO, type PurchasableId } from "@/lib/model/Pricing";
import { orgAddonRepo, organizationRepo } from "@/lib/repo";
import { ToggleOrgAddon, ToggleOrgAddonInput } from "@/useCases/ee/organization/ToggleOrgAddon";
import { AuditAction, audit, getRequestContext } from "@/utils/audit";
import { assertOrgAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const toggleOrgAddon = async (data: unknown): Promise<ServerActionResponse> => {
  const validated = ToggleOrgAddonInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const reqCtx = await getRequestContext();
  const session = await assertOrgAdmin(validated.data.organizationId);

  try {
    const org = await organizationRepo.findById(validated.data.organizationId);
    if (!org) return { ok: false, error: "Organization not found" };

    const useCase = new ToggleOrgAddon(orgAddonRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_ADDON_TOGGLE,
        userId: session.user.uuid,
        targetType: "OrgAddon",
        targetId: `${validated.data.addon}`,
        metadata: {
          addon: validated.data.addon,
          tenantId: validated.data.tenantId,
          active: validated.data.active,
        },
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_ADDON_TOGGLE,
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
 * Toggle all addons in a pack atomically (server-side).
 */
export const toggleOrgPack = async (data: {
  active: boolean;
  organizationId: number;
  packId: string;
}): Promise<ServerActionResponse> => {
  const pack = ADDON_PACKS.find(p => p.id === data.packId);
  if (!pack) return { ok: false, error: "Unknown pack" };

  const reqCtx = await getRequestContext();
  const session = await assertOrgAdmin(data.organizationId);

  try {
    const org = await organizationRepo.findById(data.organizationId);
    if (!org) return { ok: false, error: "Organization not found" };

    const useCase = new ToggleOrgAddon(orgAddonRepo);
    for (const addon of pack.addons) {
      await useCase.execute({
        organizationId: data.organizationId,
        tenantId: null,
        addon,
        active: data.active,
      });
    }

    audit(
      {
        action: AuditAction.ORG_ADDON_TOGGLE,
        userId: session.user.uuid,
        targetType: "OrgAddon",
        targetId: data.packId,
        metadata: { packId: data.packId, addons: pack.addons, active: data.active },
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

const BUNDLES = { bundleComplete: BUNDLE_COMPLETE, bundlePro: BUNDLE_PRO } as const;

/**
 * Activate all packs in a bundle atomically (server-side).
 * Used for direct DB activation (dev mode without Stripe).
 */
export const activateBundle = async (data: {
  bundleId: "bundleComplete" | "bundlePro";
  organizationId: number;
}): Promise<ServerActionResponse> => {
  const bundle = BUNDLES[data.bundleId];
  if (!bundle) return { ok: false, error: "Unknown bundle" };

  const reqCtx = await getRequestContext();
  const session = await assertOrgAdmin(data.organizationId);

  try {
    const org = await organizationRepo.findById(data.organizationId);
    if (!org) return { ok: false, error: "Organization not found" };

    const useCase = new ToggleOrgAddon(orgAddonRepo);
    const packsToActivate = ADDON_PACKS.filter(p => bundle.packs.includes(p.id));

    for (const pack of packsToActivate) {
      for (const addon of pack.addons) {
        await useCase.execute({
          organizationId: data.organizationId,
          tenantId: null,
          addon,
          active: true,
        });
      }
    }

    audit(
      {
        action: AuditAction.ORG_ADDON_TOGGLE,
        userId: session.user.uuid,
        targetType: "OrgAddon",
        targetId: data.bundleId,
        metadata: { bundleId: data.bundleId, packs: bundle.packs, active: true },
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

/**
 * Start a Stripe checkout for a pack or bundle.
 * In dev mode (without the Stripe toggle), falls back to dev-checkout.
 * Returns the checkout URL for client-side redirect.
 */
export const startCheckout = async (data: {
  interval?: BillingInterval;
  orgSlug: string;
  purchaseId: PurchasableId;
}): Promise<ServerActionResponse<{ url: string }>> => {
  const org = await organizationRepo.findBySlug(data.orgSlug);
  if (!org) return { ok: false, error: "Organization not found" };

  await assertOrgAdmin(org.id);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || new URL(config.host).host;
  const protocol = hdrs.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  const successUrl = `${baseUrl}/org/${data.orgSlug}/addons?checkout=success`;
  const cancelUrl = `${baseUrl}/org/${data.orgSlug}/addons?checkout=cancelled`;

  const useStripe = config.env === "dev" ? (await cookies()).get("dev-use-stripe")?.value === "1" : true;

  try {
    const session = await createPackCheckoutSession(
      org,
      data.purchaseId,
      successUrl,
      cancelUrl,
      data.interval,
      useStripe,
    );
    return { ok: true, data: { url: session.url ?? successUrl } };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};
