"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { memberRoleChanged } from "@/lib/ee/tracking-provider/trackingPlan";
import { userOnTenantRepo } from "@/lib/repo";
import { UserRole, type UserStatus } from "@/prisma/enums";
import { RemoveMember } from "@/useCases/user_on_tenant/RemoveMember";
import { UpdateMemberRole } from "@/useCases/user_on_tenant/UpdateMemberRole";
import { UpdateMemberStatus } from "@/useCases/user_on_tenant/UpdateMemberStatus";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin, assertTenantOwner } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const updateMemberRole = async (data: { role: UserRole; userId: string }): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const domain = await getDomainFromHost();
  // Promouvoir en OWNER nécessite d'être owner soi-même
  const session = data.role === UserRole.OWNER ? await assertTenantOwner(domain) : await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.MEMBER_ROLE_UPDATE,
        success: false,
        error: "cannotEditOwnRole",
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditOwnRole") };
  }

  try {
    const membership = await userOnTenantRepo.findMembership(data.userId, tenant.id);
    const oldRole = membership?.role ?? "unknown";

    const useCase = new UpdateMemberRole(userOnTenantRepo);
    await useCase.execute({ userId: data.userId, tenantId: tenant.id, role: data.role });
    audit(
      {
        action: AuditAction.MEMBER_ROLE_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
        metadata: { role: data.role },
      },
      reqCtx,
    );
    void trackServerEvent(
      session.user.uuid,
      memberRoleChanged({
        tenantId: String(tenant.id),
        userId: data.userId,
        oldRole,
        newRole: data.role,
      }),
    );

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.MEMBER_ROLE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const updateMemberStatus = async (data: {
  status: UserStatus;
  userId: string;
}): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.MEMBER_STATUS_UPDATE,
        success: false,
        error: "cannotEditOwnStatus",
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotEditOwnStatus") };
  }

  try {
    const useCase = new UpdateMemberStatus(userOnTenantRepo);
    await useCase.execute({ userId: data.userId, tenantId: tenant.id, status: data.status });
    audit(
      {
        action: AuditAction.MEMBER_STATUS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
        metadata: { status: data.status },
      },
      reqCtx,
    );
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.MEMBER_STATUS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const removeMember = async (data: { userId: string }): Promise<ServerActionResponse> => {
  const t = await getTranslations("serverErrors");
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  if (data.userId === session.user.uuid) {
    audit(
      {
        action: AuditAction.MEMBER_REMOVE,
        success: false,
        error: "cannotRemoveSelf",
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("cannotRemoveSelf") };
  }

  try {
    const useCase = new RemoveMember(userOnTenantRepo);
    await useCase.execute({ userId: data.userId, tenantId: tenant.id });
    audit(
      {
        action: AuditAction.MEMBER_REMOVE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.MEMBER_REMOVE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "User",
        targetId: data.userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
