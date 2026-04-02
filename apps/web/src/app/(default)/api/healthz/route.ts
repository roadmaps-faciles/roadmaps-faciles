import { NextResponse } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";

interface CheckResult {
  latencyMs: number;
  status: "healthy" | "unhealthy";
}

export async function GET() {
  const checks: Record<string, CheckResult> = {};

  // Database check
  const dbStart = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "healthy", latencyMs: Math.round(performance.now() - dbStart) };
  } catch {
    checks.database = { status: "unhealthy", latencyMs: Math.round(performance.now() - dbStart) };
  }

  // Redis check
  const redisStart = performance.now();
  try {
    await redis.getKeys("__healthz__");
    checks.redis = { status: "healthy", latencyMs: Math.round(performance.now() - redisStart) };
  } catch {
    checks.redis = { status: "unhealthy", latencyMs: Math.round(performance.now() - redisStart) };
  }

  const isHealthy = Object.values(checks).every(c => c.status === "healthy");

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      version: config.appVersion,
      environment: config.env,
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
