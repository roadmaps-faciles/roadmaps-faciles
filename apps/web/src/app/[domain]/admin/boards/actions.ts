"use server";

import { revalidatePath } from "next/cache";

import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking";
import { boardCreated } from "@/lib/ee/tracking-provider/trackingPlan";
import { boardRepo, tenantSettingsRepo } from "@/lib/repo";
import { type Board } from "@/prisma/client";
import { CreateBoard } from "@/useCases/boards/CreateBoard";
import { DeleteBoard } from "@/useCases/boards/DeleteBoard";
import { ReorderBoards } from "@/useCases/boards/ReorderBoards";
import { UpdateBoard } from "@/useCases/boards/UpdateBoard";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const createBoard = async (data: {
  description?: string;
  name: string;
}): Promise<ServerActionResponse<Board>> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new CreateBoard(boardRepo);
    const board = await useCase.execute({ tenantId: tenant.id, name: data.name, description: data.description });
    audit(
      {
        action: AuditAction.BOARD_CREATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Board",
        targetId: String(board.id),
        metadata: { name: data.name },
      },
      reqCtx,
    );
    void trackServerEvent(session.user.uuid, boardCreated({ boardId: String(board.id), tenantId: String(tenant.id) }));

    revalidatePath("/admin/boards");
    return { ok: true, data: board };
  } catch (error) {
    audit(
      {
        action: AuditAction.BOARD_CREATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const updateBoard = async (data: {
  description?: string;
  id: number;
  name: string;
}): Promise<ServerActionResponse<Board>> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new UpdateBoard(boardRepo);
    const board = await useCase.execute(data);
    audit(
      {
        action: AuditAction.BOARD_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Board",
        targetId: String(data.id),
        metadata: { name: data.name },
      },
      reqCtx,
    );
    revalidatePath("/admin/boards");
    return { ok: true, data: board };
  } catch (error) {
    audit(
      {
        action: AuditAction.BOARD_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Board",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const deleteBoard = async (data: { id: number }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new DeleteBoard(boardRepo, tenantSettingsRepo);
    await useCase.execute(data);
    audit(
      {
        action: AuditAction.BOARD_DELETE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Board",
        targetId: String(data.id),
      },
      reqCtx,
    );
    revalidatePath("/admin/boards");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.BOARD_DELETE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "Board",
        targetId: String(data.id),
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const reorderBoards = async (data: {
  items: Array<{ id: number; order: number }>;
}): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  const reqCtx = await getRequestContext();

  try {
    const useCase = new ReorderBoards(boardRepo);
    await useCase.execute(data);
    audit({ action: AuditAction.BOARD_REORDER, userId: session.user.uuid, tenantId: tenant.id }, reqCtx);
    revalidatePath("/admin/boards");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.BOARD_REORDER,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
