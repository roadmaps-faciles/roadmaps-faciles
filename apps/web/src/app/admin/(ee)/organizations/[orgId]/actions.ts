"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { isGouvDomain } from "@/lib/ee/domain-verification";
import { orgAddonRepo, orgDomainRepo, organizationRepo } from "@/lib/repo";
import { type AddonType, type OrgPlan } from "@/prisma/enums";
import { ToggleOrgAddon } from "@/useCases/ee/organization/ToggleOrgAddon";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const updateOrgPlan = async (data: {
  orgId: number;
  plan: OrgPlan;
  reason?: string;
}): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();
  const t = await getTranslations("adminOrganizations");

  try {
    const org = await organizationRepo.findById(data.orgId);
    if (!org) {
      return { ok: false, error: t("orgNotFound") };
    }

    if (data.plan === "GOV") {
      const domains = await orgDomainRepo.findByOrgId(org.id);
      const hasVerifiedGouv = domains.some(d => d.isGouv && d.verifiedAt && isGouvDomain(d.domain));
      if (!hasVerifiedGouv) {
        audit(
          {
            action: AuditAction.ROOT_ORG_PLAN_UPDATE,
            success: false,
            error: "noVerifiedGouvDomain",
            userId: session.user.uuid,
            targetType: "Organization",
            targetId: String(org.id),
            metadata: { from: org.plan, to: data.plan },
          },
          reqCtx,
        );
        return { ok: false, error: t("govRequiresVerifiedDomain") };
      }
    }

    const previousPlan = org.plan;
    await organizationRepo.update(org.id, { plan: data.plan });
    audit(
      {
        action: AuditAction.ROOT_ORG_PLAN_UPDATE,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(org.id),
        metadata: { field: "plan", from: previousPlan, reason: data.reason, to: data.plan },
      },
      reqCtx,
    );
    revalidatePath(`/admin/organizations/${data.orgId}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_ORG_PLAN_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(data.orgId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const toggleOrgAddonAdmin = async (data: {
  active: boolean;
  addon: AddonType;
  orgId: number;
}): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const useCase = new ToggleOrgAddon(orgAddonRepo);
    await useCase.execute({
      organizationId: data.orgId,
      tenantId: null,
      addon: data.addon,
      active: data.active,
    });
    audit(
      {
        action: AuditAction.ROOT_ORG_ADDON_TOGGLE,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(data.orgId),
        metadata: { addon: data.addon, active: data.active },
      },
      reqCtx,
    );
    revalidatePath(`/admin/organizations/${data.orgId}`);
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_ORG_ADDON_TOGGLE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(data.orgId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const deleteOrganizationAdmin = async (data: {
  confirmSlug: string;
  orgId: number;
}): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();
  const t = await getTranslations("adminOrganizations");

  try {
    const org = await organizationRepo.findById(data.orgId);
    if (!org) {
      return { ok: false, error: t("orgNotFound") };
    }

    if (data.confirmSlug !== org.slug) {
      audit(
        {
          action: AuditAction.ROOT_ORG_DELETE,
          success: false,
          error: "slugMismatch",
          userId: session.user.uuid,
          targetType: "Organization",
          targetId: String(org.id),
        },
        reqCtx,
      );
      return { ok: false, error: t("slugMismatch") };
    }

    // Atomic cascade: soft-delete tenants, hard-delete members/domains/addons/org
    await prisma.$transaction(async tx => {
      await tx.tenant.updateMany({
        where: { organizationId: org.id, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      await tx.orgMember.deleteMany({ where: { organizationId: org.id } });
      await tx.orgDomain.deleteMany({ where: { organizationId: org.id } });
      await tx.orgAddon.deleteMany({ where: { organizationId: org.id } });
      await tx.organization.delete({ where: { id: org.id } });
    });

    audit(
      {
        action: AuditAction.ROOT_ORG_DELETE,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(org.id),
        metadata: { name: org.name, slug: org.slug, plan: org.plan },
      },
      reqCtx,
    );
    revalidatePath("/admin/organizations");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_ORG_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "Organization",
        targetId: String(data.orgId),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
