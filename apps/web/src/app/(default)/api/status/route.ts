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

// Public aggregated status for the /status page and the sidebar widget. Stateless: every call
// re-probes. Distinct from /api/healthz, which is the infra (Docker) healthcheck of the service
// itself and must stay narrow. Exposes service up/down + latency only, never license/secrets.
//
// Each probe is time-bounded: the S3 client has no request timeout (timeout=0), so a hung-but-
// connected backend would otherwise stall this public, polled endpoint indefinitely.
const PROBE_TIMEOUT_MS = 3000;

async function probe(key: string, fn: () => Promise<unknown>): Promise<ServiceCheck> {
  const start = performance.now();
  try {
    await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("probe timeout")), PROBE_TIMEOUT_MS)),
    ]);
    return { key, status: "healthy", latencyMs: Math.round(performance.now() - start) };
  } catch {
    return { key, status: "unhealthy", latencyMs: Math.round(performance.now() - start) };
  }
}

export async function GET() {
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

  return NextResponse.json(
    {
      status,
      services,
      uptimeSeconds: Math.round(process.uptime()),
      version: config.appVersion,
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
