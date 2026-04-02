"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { orgDomainRepo, organizationRepo } from "@/lib/repo";
import { AddOrgDomain, AddOrgDomainInput } from "@/useCases/ee/organization/AddOrgDomain";
import { RemoveOrgDomain, RemoveOrgDomainInput } from "@/useCases/ee/organization/RemoveOrgDomain";
import { VerifyOrgDomain, VerifyOrgDomainInput } from "@/useCases/ee/organization/VerifyOrgDomain";
import { AuditAction, audit, getRequestContext } from "@/utils/audit";
import { assertOrgAdmin, assertOrgOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const addOrgDomain = async (data: unknown): Promise<ServerActionResponse> => {
  const reqCtx = await getRequestContext();
  const validated = AddOrgDomainInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const session = await assertOrgAdmin(validated.data.organizationId);

  try {
    const useCase = new AddOrgDomain(orgDomainRepo);
    const domain = await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_DOMAIN_ADD,
        userId: session.user.uuid,
        targetType: "OrgDomain",
        targetId: String(domain.id),
        metadata: { domain: validated.data.domain },
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_DOMAIN_ADD,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const verifyOrgDomain = async (data: unknown): Promise<ServerActionResponse> => {
  const reqCtx = await getRequestContext();
  const validated = VerifyOrgDomainInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const orgDomain = await orgDomainRepo.findById(validated.data.orgDomainId);
  if (!orgDomain) {
    return { ok: false, error: "Domaine introuvable." };
  }

  const session = await assertOrgAdmin(orgDomain.organizationId);

  try {
    const useCase = new VerifyOrgDomain(orgDomainRepo, organizationRepo);
    const result = await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_DOMAIN_VERIFY,
        userId: session.user.uuid,
        targetType: "OrgDomain",
        targetId: String(orgDomain.id),
        metadata: {
          domain: orgDomain.domain,
          verified: result.verified,
          planUpgraded: result.planUpgraded,
        },
      },
      reqCtx,
    );

    if (result.planUpgraded) {
      audit(
        {
          action: AuditAction.ROOT_ORG_PLAN_UPDATE,
          userId: session.user.uuid,
          targetType: "Organization",
          targetId: String(orgDomain.organizationId),
          metadata: {
            previousPlan: "BASE",
            newPlan: "GOV",
            reason: "auto_upgrade_gouv_domain",
            triggerDomain: orgDomain.domain,
          },
        },
        reqCtx,
      );
    }

    revalidatePath("/org", "layout");

    if (!result.verified) {
      return { ok: false, error: "Le record TXT DNS n'a pas été trouvé. Vérifiez votre configuration DNS." };
    }

    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_DOMAIN_VERIFY,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const removeOrgDomain = async (data: unknown): Promise<ServerActionResponse> => {
  const reqCtx = await getRequestContext();
  const validated = RemoveOrgDomainInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const session = await assertOrgOwner(validated.data.organizationId);

  try {
    const useCase = new RemoveOrgDomain(orgDomainRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_DOMAIN_REMOVE,
        userId: session.user.uuid,
        targetType: "OrgDomain",
        targetId: String(validated.data.orgDomainId),
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_DOMAIN_REMOVE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
