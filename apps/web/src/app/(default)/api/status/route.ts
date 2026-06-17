import { NextResponse } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";
import { getStorageProvider } from "@/lib/ee/storage-provider";

type ServiceStatus = "healthy" | "unhealthy";

interface ServiceCheck {
  key: string;
  latencyMs: number;
  status: ServiceStatus;
}

interface StatusPayload {
  services: ServiceCheck[];
  status: "degraded" | "down" | "operational";
  timestamp: string;
  uptimeSeconds: number;
  version: string;
}

// Public aggregated status for the /status page and the sidebar widget. Distinct from /api/healthz,
// which is the infra (Docker) healthcheck of the service itself and must stay narrow. Exposes service
// up/down + latency only, never license/secrets.
//
// Each probe is time-bounded: the S3 client has no request timeout (timeout=0), so a hung-but-
// connected backend would otherwise stall this public, polled endpoint indefinitely.
const PROBE_TIMEOUT_MS = 3000;

// Short in-process memo: the endpoint is public, unauthenticated and polled (3 admin sidebars + the
// public page). The cache + single-flight cap real probes to one set per window regardless of inbound
// volume, killing the amplification toward DB/Redis/S3 while staying fresh enough at a 30s poll.
const CACHE_TTL_MS = 5000;
let cached: { at: number; payload: StatusPayload } | null = null;
let inFlight: null | Promise<StatusPayload> = null;

async function probe(key: string, fn: () => Promise<unknown>): Promise<ServiceCheck> {
  const start = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("probe timeout")), PROBE_TIMEOUT_MS);
      }),
    ]);
    return { key, status: "healthy", latencyMs: Math.round(performance.now() - start) };
  } catch {
    return { key, status: "unhealthy", latencyMs: Math.round(performance.now() - start) };
  } finally {
    clearTimeout(timer);
  }
}

async function computeStatus(): Promise<StatusPayload> {
  const probes = [
    probe("database", () => prisma.$queryRaw`SELECT 1`),
    probe("redis", () => redis.getKeys("__status__")),
  ];
  // getObject on a missing key resolves to null when connected, throws on a connection failure.
  if (config.storageProvider.type === "s3") {
    probes.push(probe("storage", () => getStorageProvider().getObject("__status_probe__")));
  }

  const services = await Promise.all(probes);
  const healthy = services.filter(s => s.status === "healthy").length;
  const status = healthy === services.length ? "operational" : healthy === 0 ? "down" : "degraded";

  return {
    status,
    services,
    uptimeSeconds: Math.round(process.uptime()),
    version: config.appVersion,
    timestamp: new Date().toISOString(),
  };
}

async function getStatus(): Promise<StatusPayload> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.payload;
  inFlight ??= computeStatus()
    .then(payload => {
      cached = { at: Date.now(), payload };
      return payload;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export async function GET() {
  const payload = await getStatus();
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
