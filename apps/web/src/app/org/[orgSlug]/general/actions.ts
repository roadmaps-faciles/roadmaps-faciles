"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { cancelSubscription } from "@/lib/ee/billing/subscriptions";
import { OrganizationInput } from "@/lib/model/Organization";
import { organizationRepo } from "@/lib/repo";
import { AuditAction, audit, getRequestContext } from "@/utils/audit";
import { assertOrgOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

const UpdateOrganizationInput = OrganizationInput.extend({
  orgId: z.number(),
});

export const updateOrganization = async (data: unknown): Promise<ServerActionResponse> => {
  const reqCtx = await getRequestContext();
  const validated = UpdateOrganizationInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const { orgId, name, slug } = validated.data;
  const session = await assertOrgOwner(orgId);

  try {
    await organizationRepo.update(orgId, { name, slug });

    audit(
      {
        action: AuditAction.ORG_UPDATE,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(orgId),
        metadata: { field: "general", name, slug },
      },
      reqCtx,
    );

    revalidatePath(`/org/${slug}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(orgId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const deleteOrganization = async (orgId: number, confirmSlug: string): Promise<ServerActionResponse> => {
  const reqCtx = await getRequestContext();
  const session = await assertOrgOwner(orgId);
  const t = await getTranslations("orgAdmin.general");

  try {
    const org = await organizationRepo.findById(orgId);
    if (!org) {
      audit(
        {
          action: AuditAction.ORG_DELETE,
          success: false,
          error: "orgNotFound",
          userId: session.user.uuid,
          targetType: "Organization",
          targetId: String(orgId),
        },
        reqCtx,
      );
      return { ok: false, error: t("orgNotFound") };
    }

    if (confirmSlug !== org.slug) {
      audit(
        {
          action: AuditAction.ORG_DELETE,
          success: false,
          error: "slugMismatch",
          userId: session.user.uuid,
          targetType: "Organization",
          targetId: String(orgId),
        },
        reqCtx,
      );
      return { ok: false, error: t("slugMismatch") };
    }

    // Cancel Stripe subscription if active
    if (org.stripeSubscriptionId) {
      await cancelSubscription(org);
    }

    // Delete org - ON DELETE CASCADE handles all children automatically
    await organizationRepo.delete(org.id);

    audit(
      {
        action: AuditAction.ORG_DELETE,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(orgId),
        metadata: { ...{ slug: org.slug, plan: org.plan } },
      },
      reqCtx,
    );

    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(orgId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
