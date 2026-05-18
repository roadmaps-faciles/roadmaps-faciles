import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { config } from "@/config";
import { logger } from "@/lib/logger";

export function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");
  const state = url.searchParams.get("state");

  if (!installationId) {
    return NextResponse.json({ error: "Missing installation_id" }, { status: StatusCodes.BAD_REQUEST });
  }

  logger.info({ installationId, setupAction, state }, "GitHub App installation callback received");

  const targetHost = state ? `${url.protocol}//${state}` : config.host;
  const redirectUrl = new URL("/admin/integrations/new", targetHost);
  redirectUrl.searchParams.set("type", "GITHUB");
  redirectUrl.searchParams.set("github_installation_id", installationId);

  return NextResponse.redirect(redirectUrl);
}
