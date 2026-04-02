import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import z from "zod";

import { tenantRepo } from "@/lib/repo";

export async function POST(request: Request) {
  const { subdomain } = z
    .object({
      subdomain: z.string(),
    })
    .parse(await request.json());

  const tenant = await tenantRepo.findBySubdomain(subdomain);
  if (!tenant) {
    return new Response("Tenant not found", { status: StatusCodes.NOT_FOUND });
  }
  return NextResponse.json(tenant);
}
