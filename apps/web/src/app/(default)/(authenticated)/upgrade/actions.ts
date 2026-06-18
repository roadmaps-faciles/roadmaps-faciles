"use server";

import { assertCloud } from "@/lib/deployment";
import { OrganizationInput } from "@/lib/model/Organization";
import { organizationRepo } from "@/lib/repo";
import { AuditAction, audit, getRequestContext } from "@/utils/audit";
import { assertOrgOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

/**
 * Legacy upgrade action - updates org name/slug and redirects to the addons page.
 * In the addon-first model, there is no plan upgrade - users buy addons à la carte.
 */
export const upgradeOrganization = async (data: {
  name: string;
  orgId: number;
  slug: string;
}): Promise<ServerActionResponse<{ checkoutUrl: string }>> => {
  await assertCloud();
  const reqCtx = await getRequestContext();
  const session = await assertOrgOwner(data.orgId);

  const validated = OrganizationInput.safeParse({ name: data.name, slug: data.slug });
  if (!validated.success) {
    return { ok: false, error: "Invalid organization name or slug" };
  }

  try {
    const org = await organizationRepo.findById(data.orgId);
    if (!org) return { ok: false, error: "Organization not found" };

    if (org.plan !== "BASE") {
      return { ok: false, error: "Organization is already on a paid plan" };
    }

    // Check slug uniqueness (skip if unchanged)
    if (validated.data.slug !== org.slug) {
      const existing = await organizationRepo.findBySlug(validated.data.slug);
      if (existing) {
        return { ok: false, error: "Slug already taken" };
      }
    }

    // Update org name/slug
    await organizationRepo.update(org.id, {
      name: validated.data.name,
      slug: validated.data.slug,
    });

    audit(
      {
        action: AuditAction.ORG_CHECKOUT_CREATED,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(org.id),
        metadata: { ...{ orgSlug: validated.data.slug, upgrade: true } },
      },
      reqCtx,
    );

    // Redirect to addons page where user can subscribe to specific addons
    return { ok: true, data: { checkoutUrl: `/org/${validated.data.slug}/addons` } };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_CHECKOUT_CREATED,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
