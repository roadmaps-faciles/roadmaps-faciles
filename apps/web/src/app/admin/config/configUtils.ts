const SENSITIVE_KEYS = new Set([
  "secret",
  "password",
  "apikey",
  "apitoken",
  "accesskey",
  "secretkey",
  "secretaccesskey",
  "clientsecret",
  "applicationsecret",
  "consumerkey",
  "consumersecret",
  "token",
  "tokensecret",
  "webhooksecret",
  "cronsecret",
  "encryptionkey",
  "licensekey",
]);

export function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[_-]/g, "");
  return SENSITIVE_KEYS.has(normalized);
}

export function maskValue(value: string): string {
  if (value.length <= 4) return "••••";
  return value.slice(0, 2) + "••••" + value.slice(-2);
}

export type ConfigEntry = { key: string; masked: boolean; value: string };
export type ConfigSection = { entries: ConfigEntry[]; section: string };

const stringifyConfigValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  return "";
};

export function flattenConfig(obj: Record<string, unknown>, prefix = ""): ConfigEntry[] {
  const entries: ConfigEntry[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      entries.push(...flattenConfig(value as Record<string, unknown>, fullKey));
      continue;
    }

    const strValue = stringifyConfigValue(value);
    const sensitive = isSensitiveKey(key);
    entries.push({
      key: fullKey,
      value: sensitive && strValue ? maskValue(strValue) : strValue,
      masked: sensitive && !!strValue,
    });
  }

  return entries;
}
