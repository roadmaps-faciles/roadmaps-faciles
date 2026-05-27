"use server";

import { revalidatePath } from "next/cache";

import { config } from "@/config";
import { clearCapturedEvents } from "@/lib/ee/tracking-provider/memory/server";
import { assertAdmin } from "@/utils/auth";

export async function clearTrackingDebugEvents(): Promise<void> {
  await assertAdmin();
  if (config.tracking.provider !== "memory") return;
  clearCapturedEvents();
  revalidatePath("/admin/analytics-debug");
}
