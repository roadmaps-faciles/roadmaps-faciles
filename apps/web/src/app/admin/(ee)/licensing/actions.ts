"use server";

import { revalidatePath } from "next/cache";

import {
  type CreateLicenseInput,
  type CreateLicenseResult,
  type License,
  type LicenseVerification,
  type ListLicensesFilters,
  type ListLicensesResult,
  LicensingAdminApiError,
  licensingAdminClient,
} from "@/lib/ee/licensing/adminClient";
import { verifyLicenseOnline } from "@/lib/ee/licensing/licenseFetcher";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { parseLicenseKey } from "@/lib/ee/licensing/licenseVerifier";
import { type LicenseStatus } from "@/lib/ee/licensing/types";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const refreshLicenseAction = async (): Promise<ServerActionResponse<LicenseStatus>> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const status = await getLicenseStatus(true);

    audit(
      {
        action: AuditAction.ROOT_LICENSE_REFRESH,
        userId: session.user.uuid,
        metadata: { ...{ mode: status.mode, plan: status.plan, valid: status.valid } },
      },
      reqCtx,
    );

    revalidatePath("/admin/licensing");
    return { data: status, ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.ROOT_LICENSE_REFRESH,
        error: (error as Error).message,
        success: false,
        userId: session.user.uuid,
      },
      reqCtx,
    );
    return { error: (error as Error).message, ok: false };
  }
};

export const createLicenseAdminAction = async (
  input: CreateLicenseInput,
): Promise<ServerActionResponse<CreateLicenseResult>> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const result = await licensingAdminClient.createLicense(input);

    audit(
      {
        action: AuditAction.ROOT_LICENSE_ADMIN_CREATE,
        userId: session.user.uuid,
        metadata: { licenseId: result.licenseId, plan: input.plan, email: input.email, expiresAt: input.expiresAt },
      },
      reqCtx,
    );

    revalidatePath("/admin/licensing");
    return { data: result, ok: true };
  } catch (error) {
    const message = error instanceof LicensingAdminApiError ? error.message : (error as Error).message;
    audit(
      {
        action: AuditAction.ROOT_LICENSE_ADMIN_CREATE,
        error: message,
        success: false,
        userId: session.user.uuid,
        metadata: { plan: input.plan, email: input.email },
      },
      reqCtx,
    );
    return { error: message, ok: false };
  }
};

export const revokeLicenseAdminAction = async (id: string): Promise<ServerActionResponse<{ license: License }>> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const result = await licensingAdminClient.revokeLicense(id);

    audit(
      {
        action: AuditAction.ROOT_LICENSE_ADMIN_REVOKE,
        userId: session.user.uuid,
        metadata: { licenseId: id, email: result.license.email, plan: result.license.plan },
      },
      reqCtx,
    );

    revalidatePath("/admin/licensing");
    return { data: result, ok: true };
  } catch (error) {
    const message = error instanceof LicensingAdminApiError ? error.message : (error as Error).message;
    audit(
      {
        action: AuditAction.ROOT_LICENSE_ADMIN_REVOKE,
        error: message,
        success: false,
        userId: session.user.uuid,
        metadata: { licenseId: id },
      },
      reqCtx,
    );
    return { error: message, ok: false };
  }
};

export const listLicensesAdminAction = async (
  filters: ListLicensesFilters = {},
): Promise<ServerActionResponse<ListLicensesResult>> => {
  await assertAdmin();

  try {
    const data = await licensingAdminClient.listLicenses(filters);
    return { data, ok: true };
  } catch (error) {
    const message = error instanceof LicensingAdminApiError ? error.message : (error as Error).message;
    return { error: message, ok: false };
  }
};

export const getLicenseDetailAdminAction = async (
  id: string,
): Promise<ServerActionResponse<{ distinctInstances: number; license: License }>> => {
  await assertAdmin();

  try {
    const data = await licensingAdminClient.getLicense(id);
    return { data, ok: true };
  } catch (error) {
    const message = error instanceof LicensingAdminApiError ? error.message : (error as Error).message;
    return { error: message, ok: false };
  }
};

export interface VerifyKeyResult {
  offline: { expiresAt: null | string; payload: boolean; plan: null | string; signatureValid: boolean };
  online: {
    expiresAt?: string;
    plan?: string;
    status: "active" | "expired" | "invalid" | "revoked" | "unreachable";
    valid: boolean;
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const verifyLicenseKeyAction = async (
  key: string,
  instanceId: string,
): Promise<ServerActionResponse<VerifyKeyResult>> => {
  await assertAdmin();

  const safeInstanceId = UUID_REGEX.test(instanceId) ? instanceId : `verify-test-${crypto.randomUUID()}`;

  const parsed = parseLicenseKey(key);
  const offline = {
    expiresAt: parsed.payload?.expiresAt ?? null,
    payload: !!parsed.payload,
    plan: parsed.payload?.plan ?? null,
    signatureValid: parsed.valid,
  };

  const online = await verifyLicenseOnline(key, safeInstanceId);

  return {
    data: {
      offline,
      online: online ?? { status: "unreachable", valid: false },
    },
    ok: true,
  };
};

export const listVerificationsAdminAction = async (
  id: string,
): Promise<ServerActionResponse<{ verifications: LicenseVerification[] }>> => {
  await assertAdmin();

  try {
    const data = await licensingAdminClient.listVerifications(id);
    return { data, ok: true };
  } catch (error) {
    const message = error instanceof LicensingAdminApiError ? error.message : (error as Error).message;
    return { error: message, ok: false };
  }
};

export const renewLicenseAdminAction = async (
  id: string,
  expiresAt: string,
): Promise<ServerActionResponse<{ license: License }>> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  try {
    const result = await licensingAdminClient.renewLicense(id, expiresAt);

    audit(
      {
        action: AuditAction.ROOT_LICENSE_ADMIN_RENEW,
        userId: session.user.uuid,
        metadata: { licenseId: id, email: result.license.email, expiresAt },
      },
      reqCtx,
    );

    revalidatePath("/admin/licensing");
    return { data: result, ok: true };
  } catch (error) {
    const message = error instanceof LicensingAdminApiError ? error.message : (error as Error).message;
    audit(
      {
        action: AuditAction.ROOT_LICENSE_ADMIN_RENEW,
        error: message,
        success: false,
        userId: session.user.uuid,
        metadata: { licenseId: id, expiresAt },
      },
      reqCtx,
    );
    return { error: message, ok: false };
  }
};
