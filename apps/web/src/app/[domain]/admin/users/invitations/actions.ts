"use server";

import { revalidatePath } from "next/cache";

import { config } from "@/config";
import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { invitationSent } from "@/lib/ee/tracking-provider/trackingPlan";
import { invitationRepo, tenantSettingsRepo, userOnTenantRepo, userRepo } from "@/lib/repo";
import { type UserEmailSearchResult } from "@/lib/repo/IUserRepo";
import { type Invitation } from "@/prisma/client";
import { UserRole } from "@/prisma/enums";
import { RevokeInvitation } from "@/useCases/invitations/RevokeInvitation";
import { type InvitationRole, SendInvitation } from "@/useCases/invitations/SendInvitation";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin, assertTenantOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const sendInvitation = async (data: {
  email: string;
  role?: InvitationRole;
}): Promise<ServerActionResponse<Invitation>> => {
  const domain = await getDomainFromHost();

  const session = data.role === "OWNER" ? await assertTenantOwner(domain) : await assertTenantAdmin(domain);

  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new SendInvitation(invitationRepo, userRepo, userOnTenantRepo);
    const settings = await tenantSettingsRepo.findByTenantId(tenant.id);
    if (!settings) throw new Error("Settings not found");

    const tenantUrl = `${config.host.split("//")[0]}//${settings.subdomain}.${config.rootDomain}`;
    const invitation = await useCase.execute({
      tenantId: tenant.id,
      email: data.email,
      tenantUrl,
      role: data.role ?? UserRole.USER,
      locale: settings.locale,
      uiTheme: settings.uiTheme,
    });
    audit(
      {
        action: AuditAction.INVITATION_SEND,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Invitation",
        targetId: String(invitation.id),
        metadata: { email: data.email, role: data.role },
      },
      reqCtx,
    );
    void trackServerEvent(
      session.user.uuid,
      invitationSent({ tenantId: String(tenant.id), role: data.role ?? UserRole.USER }),
    );

    revalidatePath("/admin/users/invitations");
    return { ok: true, data: invitation };
  } catch (error) {
    audit(
      {
        action: AuditAction.INVITATION_SEND,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        metadata: { email: data.email },
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const searchUsersForInvitation = async (query: string): Promise<UserEmailSearchResult[]> => {
  const domain = await getDomainFromHost();
  await assertTenantAdmin(domain);
  const trimmed = query.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return [];
  return userRepo.searchByEmail(trimmed);
};

export const revokeInvitation = async (data: { id: number }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new RevokeInvitation(invitationRepo);
    await useCase.execute(data);
    audit(
      {
        action: AuditAction.INVITATION_REVOKE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Invitation",
        targetId: String(data.id),
      },
      reqCtx,
    );
    revalidatePath("/admin/users/invitations");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.INVITATION_REVOKE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Invitation",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
