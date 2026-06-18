"use server";

import { notFound } from "next/navigation";

import { config } from "@/config";
import { type DeploymentMode } from "@/lib/deployment";
import { devOverrides } from "@/lib/devOverride";
import { licensingAdminClient } from "@/lib/ee/licensing/adminClient";
import { getOrCreateInstanceId } from "@/lib/ee/licensing/instanceId";
import { activateLicenseOnline } from "@/lib/ee/licensing/licenseFetcher";
import { getEffectiveLicenseKey, resetLicenseStatusCache } from "@/lib/ee/licensing/licenseService";
import { parseLicenseKey } from "@/lib/ee/licensing/licenseVerifier";
import { logger } from "@/lib/logger";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

// All dev overrides (deployment mode, license, Stripe toggle) live in the process-wide devOverrides
// store, shared across every host of the single dev process. No dev cookies.
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

    // Process-wide dev override (shared across all hosts in the single dev process, unlike cookies).
    // Issuing a license implies self-host testing — flip deployment mode so the licensing UI reflects it.
    devOverrides.licenseKey = result.licenseKey;
    devOverrides.deploymentMode = "self-host";

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

  devOverrides.licenseKey = undefined;
  devOverrides.licenseOffline = undefined;
  devOverrides.deploymentMode = undefined;
  resetLicenseStatusCache();

  return { ok: true };
};

export const setDeploymentModeDevAction = async (mode: DeploymentMode): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  devOverrides.deploymentMode = mode;

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

  devOverrides.licenseOffline = value;
  resetLicenseStatusCache();

  return { ok: true };
};

export const toggleStripeCheckoutDevAction = async (value: boolean): Promise<ServerActionResponse<void>> => {
  assertDev();
  await assertAdmin();

  devOverrides.useStripe = value;

  return { ok: true };
};
