import { type ConsentPayload, type Finality, type FinalityConsent } from "./types";

export const STORAGE_KEY = "rf-consent";
export const STORAGE_VERSION = 1;

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

function parseStoredConsent(raw: null | string, activeFinalities: readonly Finality[]): FinalityConsent | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPayload>;
    if (parsed.version !== STORAGE_VERSION) return undefined;
    if (!parsed.finalityConsent || typeof parsed.finalityConsent !== "object") return undefined;
    for (const finality of activeFinalities) {
      if (typeof parsed.finalityConsent[finality] !== "boolean") return undefined;
    }
    return parsed.finalityConsent;
  } catch {
    return undefined;
  }
}

let cachedRaw: null | string | undefined = undefined;
let cachedSnapshot: FinalityConsent | undefined = undefined;

export function readStoredConsent(activeFinalities: readonly Finality[]): FinalityConsent | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = parseStoredConsent(raw, activeFinalities);
  return cachedSnapshot;
}

export function writeStoredConsent(finalityConsent: FinalityConsent): void {
  if (typeof window === "undefined") return;
  const payload: ConsentPayload = {
    decidedAt: new Date().toISOString(),
    finalityConsent,
    version: STORAGE_VERSION,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    notify();
  } catch {
    // localStorage may be unavailable (private mode, quota): degrade silently
  }
}

export function clearStoredConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  } catch {
    // ignore
  }
}

export function buildActiveFinalities(trackingProvider: string): readonly Finality[] {
  if (trackingProvider === "posthog") return ["posthog"];
  if (trackingProvider === "matomo") return ["matomo"];
  return [];
}
