export interface LicensePayload {
  expiresAt: string; // ISO 8601
  licenseId: string;
  plan: "GOV_LICENSED" | "LICENSED";
}

export interface LicenseStatus {
  expiresAt?: Date;
  gracePeriodEnd?: Date;
  lastVerified?: Date;
  mode: "community" | "licensed";
  plan?: "GOV_LICENSED" | "LICENSED";
  /** Why the instance fell back to community: no key set vs a present-but-invalid key. */
  reason?: "invalid" | "no-key";
  valid: boolean;
}
