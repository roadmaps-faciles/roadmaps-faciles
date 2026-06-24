import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { isSafeRelativeCallbackUrl } from "@/app/(default)/login/loginHrefs";
import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { stripe } from "@/lib/ee/billing/stripe";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/next-auth/auth";

/**
 * Dev-only checkout route - simulates Stripe checkout when STRIPE_SECRET_KEY is not set.
 * Activates the requested addons, creates a dev subscription ID, and redirects.
 */
export async function GET(request: NextRequest) {
  // Block in production when Stripe is configured
  if (stripe) {
    return NextResponse.json(
      { error: "Dev checkout is disabled when Stripe is configured" },
      { status: StatusCodes.FORBIDDEN },
    );
  }

  // Self-host has no checkout (license-based entitlements); this dev bypass is cloud-only.
  if (await isSelfHost()) {
    return NextResponse.json({ error: "Not available in self-host" }, { status: StatusCodes.FORBIDDEN });
  }

  // Auth check - only authenticated users
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const orgId = request.nextUrl.searchParams.get("orgId");
  const successUrl = request.nextUrl.searchParams.get("successUrl");
  const addonsParam = request.nextUrl.searchParams.get("addons");
  const purchaseId = request.nextUrl.searchParams.get("purchaseId");
  const interval =
    request.nextUrl.searchParams.get("interval") === "yearly" ? ("YEARLY" as const) : ("MONTHLY" as const);

  if (!orgId || !successUrl) {
    return NextResponse.json({ error: "Missing orgId or successUrl" }, { status: StatusCodes.BAD_REQUEST });
  }

  // Validate successUrl is relative (no open redirect)
  if (!isSafeRelativeCallbackUrl(successUrl)) {
    return NextResponse.json({ error: "successUrl must be a relative path" }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const orgIdNum = Number(orgId);

    // Verify user is ADMIN+ on the org
    const membership = await prisma.orgMember.findFirst({
      where: { organizationId: orgIdNum, userId: session.user.uuid },
    });
    if (!membership || !["ADMIN", "OWNER"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: StatusCodes.FORBIDDEN });
    }

    // Set dev subscription ID + customer ID
    await prisma.organization.update({
      where: { id: orgIdNum },
      data: {
        stripeCustomerId: `dev_cus_${orgId}`,
        stripeSubscriptionId: `dev_sub_${orgId}`,
      },
    });

    // Activate requested addons (org-global, tenantId = null)
    if (addonsParam) {
      const addons = addonsParam.split(",").filter(Boolean);
      for (const addon of addons) {
        const existing = await prisma.orgAddon.findFirst({
          where: { organizationId: orgIdNum, tenantId: null, addon: addon as never },
        });
        if (existing) {
          await prisma.orgAddon.update({
            where: { id: existing.id },
            data: { active: true, billingInterval: interval, purchaseId },
          });
        } else {
          await prisma.orgAddon.create({
            data: {
              organizationId: orgIdNum,
              tenantId: null,
              addon: addon as never,
              active: true,
              billingInterval: interval,
              purchaseId,
            },
          });
        }
      }
    }

    logger.info({ orgId, addons: addonsParam }, "[dev-checkout] Addon checkout simulated (Stripe bypassed)");

    return NextResponse.redirect(new URL(successUrl, config.host));
  } catch (error) {
    logger.error({ err: error, orgId }, "[dev-checkout] Failed to process checkout");
    return NextResponse.json({ error: "Failed to process checkout" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
