import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");

  if (!installationId) {
    return NextResponse.json({ error: "Missing installation_id" }, { status: StatusCodes.BAD_REQUEST });
  }

  logger.info({ installationId, setupAction }, "GitHub App installation callback received");

  const redirectUrl = new URL("/admin/integrations/new", url.origin);
  redirectUrl.searchParams.set("github_installation_id", installationId);

  return NextResponse.redirect(redirectUrl);
}
