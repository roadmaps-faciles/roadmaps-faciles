import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { config } from "@/config";
import { isAppBotSender } from "@/lib/ee/integration-provider/impl/github/GitHubSyncGuard";
import { logger } from "@/lib/logger";
import { integrationMappingRepo, integrationRepo } from "@/lib/repo";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

interface WebhookPayload {
  action: string;
  installation?: { id: number };
  issue?: {
    body: null | string;
    html_url: string;
    labels: Array<{ name: string }>;
    number: number;
    title: string;
    updated_at: string;
  };
  sender: { id: number; type: string };
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");
  const deliveryId = request.headers.get("x-github-delivery");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const secret = config.integrations.github.appWebhookSecret;
  if (!secret) {
    logger.warn("GitHub webhook received but GITHUB_APP_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }

  const body = await request.text();

  if (!verifySignature(body, signature, secret)) {
    logger.warn("GitHub webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const payload = JSON.parse(body) as WebhookPayload;

  if (payload.sender.type === "Bot") {
    const appBotId = parseInt(config.integrations.github.appId, 10);
    if (appBotId && isAppBotSender(payload.sender.id, appBotId)) {
      logger.debug({ event, deliveryId }, "GitHub webhook skipped — sent by app bot");
      return NextResponse.json({ ok: true, skipped: true });
    }
  }

  if (!payload.installation?.id) {
    logger.warn({ event }, "GitHub webhook missing installation ID");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const integrations = await integrationRepo.findAllForTenant(-1);
  const integration = integrations.find(i => {
    if (i.type !== "GITHUB" || !i.enabled) return false;
    const cfg = i.config as Record<string, unknown>;
    return cfg.installationId === payload.installation!.id;
  });

  if (!integration) {
    logger.debug({ event, installationId: payload.installation.id }, "GitHub webhook — no matching integration");
    return NextResponse.json({ ok: true, skipped: true });
  }

  logger.info({ event, deliveryId, integrationId: integration.id }, "GitHub webhook processing");

  switch (event) {
    case "issues": {
      if (!payload.issue) break;
      const mapping = await integrationMappingRepo.findByRemoteId(
        integration.id,
        String(payload.issue.number),
      );

      if (mapping) {
        logger.info(
          { action: payload.action, issueNumber: payload.issue.number, mappingId: mapping.id },
          "GitHub webhook — issue event for existing mapping (full sync will reconcile)",
        );
      } else if (payload.action === "opened") {
        logger.info(
          { issueNumber: payload.issue.number },
          "GitHub webhook — new issue detected (full sync will import)",
        );
      }
      break;
    }
    case "ping":
      logger.info("GitHub webhook ping received");
      break;
    default:
      logger.debug({ event }, "GitHub webhook — unhandled event type");
  }

  return NextResponse.json({ ok: true });
}
