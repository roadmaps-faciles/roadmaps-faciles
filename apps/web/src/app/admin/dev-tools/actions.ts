"use server";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { config } from "@/config";
import { type DeploymentMode, DEV_DEPLOYMENT_MODE_COOKIE } from "@/lib/deployment";
import { licensingAdminClient } from "@/lib/ee/licensing/adminClient";
import { getOrCreateInstanceId } from "@/lib/ee/licensing/instanceId";
import { activateLicenseOnline } from "@/lib/ee/licensing/licenseFetcher";
import {
  DEV_LICENSE_KEY_COOKIE,
  DEV_LICENSE_OFFLINE_COOKIE,
  getEffectiveLicenseKey,
  resetLicenseStatusCache,
} from "@/lib/ee/licensing/licenseService";
import { parseLicenseKey } from "@/lib/ee/licensing/licenseVerifier";
import { logger } from "@/lib/logger";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const assertDev = () => {
  if (config.env !== "dev") notFound();
};

export const issueAndBindDevAction = async (): Promise<ServerActionResponse<{ licenseKey: string }>> => {
  assertDev();
  await assertAdmin();

  try {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const result = await licensingAdminClient.createLicense({
      email: "dev-tools@example.com",
      expiresAt: expiresAt.toISOString(),
      plan: "GOV_LICENSED",
    });

    const cookieStore = await cookies();
    cookieStore.set(DEV_LICENSE_KEY_COOKIE, result.licenseKey, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    // Issuing a license implies self-host testing — flip deployment mode so the licensing UI reflects it.
    cookieStore.set(DEV_DEPLOYMENT_MODE_COOKIE, "self-host", {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });

    const instanceId = await getOrCreateInstanceId();
    void activateLicenseOnline(result.licenseKey, instanceId);
    resetLicenseStatusCache();

    return { data: { licenseKey: result.licenseKey }, ok: true };
  } catch (error) {
    logger.warn({ err: error, licensingServerUrl: config.licensingServerUrl }, "Dev license issue failed");
    return { error: (error as Error).message, ok: false };
  }
};

export const clearDevLicenseOverrideAction = async (): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  const cookieStore = await cookies();
  cookieStore.delete(DEV_LICENSE_KEY_COOKIE);
  cookieStore.delete(DEV_LICENSE_OFFLINE_COOKIE);
  cookieStore.delete(DEV_DEPLOYMENT_MODE_COOKIE);
  resetLicenseStatusCache();

  return { ok: true };
};

export const setDeploymentModeDevAction = async (mode: DeploymentMode): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  const cookieStore = await cookies();
  cookieStore.set(DEV_DEPLOYMENT_MODE_COOKIE, mode, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  return { ok: true };
};

export const forceExpireDevAction = async (): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  const key = await getEffectiveLicenseKey();
  if (!key) return { error: "no-license", ok: false };

  const { payload, valid } = parseLicenseKey(key);
  if (!valid || !payload) return { error: "invalid-license", ok: false };

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await licensingAdminClient.renewLicense(payload.licenseId, yesterday.toISOString());
    resetLicenseStatusCache();

    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message, ok: false };
  }
};

export const toggleOfflineDevAction = async (value: boolean): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  const cookieStore = await cookies();
  if (value) {
    cookieStore.set(DEV_LICENSE_OFFLINE_COOKIE, "1", {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  } else {
    cookieStore.delete(DEV_LICENSE_OFFLINE_COOKIE);
  }
  resetLicenseStatusCache();

  return { ok: true };
};

export const toggleStripeCheckoutDevAction = async (value: boolean): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  const cookieStore = await cookies();
  cookieStore.set("dev-use-stripe", value ? "1" : "0", { maxAge: COOKIE_MAX_AGE, path: "/" });

  return { ok: true };
};
