import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { config } from "@/config";
import { clearCapturedEvents, getCapturedEvents, pushCapturedEvent } from "@/lib/ee/tracking-provider/memory/server";
import { assertAdmin } from "@/utils/auth";

const PropertyValueSchema = z.union([z.boolean(), z.null(), z.number(), z.string()]);

const PayloadSchema = z.object({
  distinctId: z.string().min(1).max(200),
  event: z.string().min(1).max(200),
  properties: z.record(z.string(), PropertyValueSchema.optional()).optional(),
  type: z.enum(["group", "identify", "page", "track"]),
});

function ensureMemoryProvider(): NextResponse | null {
  if (config.tracking.provider !== "memory") {
    return NextResponse.json({ error: "Memory tracking provider is not active" }, { status: StatusCodes.NOT_FOUND });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const guard = ensureMemoryProvider();
  if (guard) return guard;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: StatusCodes.BAD_REQUEST });
  }

  const parsed = PayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: StatusCodes.BAD_REQUEST });
  }

  const captured = pushCapturedEvent({
    distinctId: parsed.data.distinctId,
    event: parsed.data.event,
    properties: parsed.data.properties ?? {},
    source: "client",
    type: parsed.data.type,
  });

  return NextResponse.json({ id: captured.id, ok: true }, { status: StatusCodes.CREATED });
}

export async function GET() {
  const guard = ensureMemoryProvider();
  if (guard) return guard;
  await assertAdmin();
  return NextResponse.json({ events: getCapturedEvents() });
}

export async function DELETE() {
  const guard = ensureMemoryProvider();
  if (guard) return guard;
  await assertAdmin();
  clearCapturedEvents();
  return new NextResponse(null, { status: StatusCodes.NO_CONTENT });
}
