import "server-only";

import { config } from "@/config";
import { logger } from "@/lib/logger";

export type LicensePlan = "GOV_LICENSED" | "LICENSED";

export interface License {
  createdAt: string;
  email: string;
  expiresAt: string;
  id: string;
  instanceId: null | string;
  plan: LicensePlan;
  revokedAt: null | string;
  stripeCustomerId: null | string;
  stripeSubscriptionId: null | string;
  updatedAt: string;
}

export interface LicenseVerification {
  id: string;
  instanceId: string;
  ip: string;
  licenseId: string;
  verifiedAt: string;
}

export interface ListLicensesResult {
  data: License[];
  nextCursor: null | string;
}

export interface ListLicensesFilters {
  cursor?: string;
  limit?: number;
  plan?: LicensePlan;
  q?: string;
  status?: "active" | "expired" | "revoked";
}

export interface CreateLicenseInput {
  email: string;
  expiresAt: string;
  plan: LicensePlan;
}

export interface CreateLicenseResult {
  expiresAt: string;
  licenseId: string;
  licenseKey: string;
}

export class LicensingAdminApiError extends Error {
  public readonly details: unknown;
  public readonly status: number;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "LicensingAdminApiError";
    this.status = status;
    this.details = details;
  }
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!config.licensingAdminApiKey) {
    throw new LicensingAdminApiError(500, "LICENSING_ADMIN_API_KEY not configured");
  }

  const url = `${config.licensingServerUrl}/admin${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.licensingAdminApiKey}`,
        ...init.headers,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    logger.warn({ err, url }, "Licensing admin API unreachable");
    throw new LicensingAdminApiError(503, "Licensing server unreachable");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { details?: unknown; error?: string } | null;
    throw new LicensingAdminApiError(res.status, body?.error ?? `HTTP ${res.status}`, body?.details);
  }

  return (await res.json()) as T;
}

export const licensingAdminClient = {
  async listLicenses(filters: ListLicensesFilters = {}): Promise<ListLicensesResult> {
    const params = new URLSearchParams();
    if (filters.plan) params.set("plan", filters.plan);
    if (filters.status) params.set("status", filters.status);
    if (filters.q) params.set("q", filters.q);
    if (filters.cursor) params.set("cursor", filters.cursor);
    if (filters.limit) params.set("limit", String(filters.limit));

    const qs = params.toString();
    return adminFetch<ListLicensesResult>(`/licenses${qs ? `?${qs}` : ""}`);
  },

  async getLicense(id: string): Promise<{ distinctInstances: number; license: License }> {
    return adminFetch(`/licenses/${id}`);
  },

  async createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult> {
    return adminFetch("/licenses", { method: "POST", body: JSON.stringify(input) });
  },

  async revokeLicense(id: string): Promise<{ license: License }> {
    return adminFetch(`/licenses/${id}/revoke`, { method: "POST" });
  },

  async renewLicense(id: string, expiresAt: string): Promise<{ license: License }> {
    return adminFetch(`/licenses/${id}/renew`, {
      method: "POST",
      body: JSON.stringify({ expiresAt }),
    });
  },

  async listVerifications(id: string): Promise<{ verifications: LicenseVerification[] }> {
    return adminFetch(`/licenses/${id}/verifications`);
  },
};
