"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { orgMemberRepo, userRepo } from "@/lib/repo";
import { InviteOrgMember, InviteOrgMemberInput } from "@/useCases/organization/InviteOrgMember";
import { RemoveOrgMember, RemoveOrgMemberInput } from "@/useCases/organization/RemoveOrgMember";
import { UpdateOrgMemberRole, UpdateOrgMemberRoleInput } from "@/useCases/organization/UpdateOrgMemberRole";
import { AuditAction, audit, getRequestContext } from "@/utils/audit";
import { assertOrgAdmin, assertOrgOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const inviteOrgMember = async (data: unknown): Promise<ServerActionResponse> => {
  const validated = InviteOrgMemberInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const reqCtx = await getRequestContext();
  const session = await assertOrgAdmin(validated.data.organizationId);

  try {
    const useCase = new InviteOrgMember(orgMemberRepo, userRepo);
    const member = await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_MEMBER_ADD,
        userId: session.user.uuid,
        targetType: "OrgMember",
        targetId: String(member.id),
        metadata: { email: validated.data.email, role: validated.data.role },
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_MEMBER_ADD,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const updateOrgMemberRole = async (data: unknown): Promise<ServerActionResponse> => {
  const validated = UpdateOrgMemberRoleInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const reqCtx = await getRequestContext();
  const session = await assertOrgOwner(validated.data.organizationId);

  try {
    const useCase = new UpdateOrgMemberRole(orgMemberRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_MEMBER_ROLE_UPDATE,
        userId: session.user.uuid,
        targetType: "OrgMember",
        targetId: String(validated.data.memberId),
        metadata: { role: validated.data.role },
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_MEMBER_ROLE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const removeOrgMember = async (data: unknown): Promise<ServerActionResponse> => {
  const validated = RemoveOrgMemberInput.safeParse(data);
  if (!validated.success) {
    return { ok: false, error: z.prettifyError(validated.error) };
  }

  const reqCtx = await getRequestContext();
  const session = await assertOrgOwner(validated.data.organizationId);

  try {
    const useCase = new RemoveOrgMember(orgMemberRepo);
    await useCase.execute(validated.data);

    audit(
      {
        action: AuditAction.ORG_MEMBER_REMOVE,
        userId: session.user.uuid,
        targetType: "OrgMember",
        targetId: String(validated.data.memberId),
      },
      reqCtx,
    );

    revalidatePath("/org", "layout");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ORG_MEMBER_REMOVE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
