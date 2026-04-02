import { type Query } from "@prisma/studio-core/data";
import { serializeError } from "@prisma/studio-core/data/bff";
import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { assertAdmin } from "@/utils/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": config.host.includes("//localhost:") ? "*" : config.host,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Use dynamic rendering for database operations
// export const dynamic = "force-dynamic";

export async function GET() {
  await assertAdmin();
  return NextResponse.json({ message: "Studio API endpoint is running" }, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  await assertAdmin();
  try {
    const { query } = z
      .object({
        query: z.unknown() as z.ZodType<Query>,
      })
      .parse(await request.json());

    const results = await prisma.$queryRawUnsafe(query.sql, ...(query.parameters ?? []));

    return NextResponse.json([null, results], { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json([serializeError(err)], {
      status: StatusCodes.BAD_REQUEST,
      headers: CORS_HEADERS,
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  await assertAdmin();
  return new NextResponse(null, { status: StatusCodes.NO_CONTENT, headers: CORS_HEADERS });
}
