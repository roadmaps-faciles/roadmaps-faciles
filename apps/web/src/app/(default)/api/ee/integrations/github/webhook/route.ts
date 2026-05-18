import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { config } from "@/config";
import { createIntegrationProvider } from "@/lib/ee/integration-provider";
import { decrypt } from "@/lib/ee/integration-provider/encryption";
import { acquireSyncLock, releaseSyncLock } from "@/lib/ee/integration-provider/impl/github/GitHubSyncGuard";
import { type IntegrationConfig } from "@/lib/ee/integration-provider/types";
import { logger } from "@/lib/logger";
import { integrationMappingRepo, integrationRepo, integrationSyncLogRepo, postRepo } from "@/lib/repo";
import { ApplyInboundChange } from "@/useCases/ee/integrations/ApplyInboundChange";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

interface WebhookPayload {
  action: string;
  discussion?: { node_id: string; number: number };
  installation?: { id: number };
  issue?: { number: number };
  projects_v2_item?: { node_id: string };
  sender?: { id: number; login: string; type: string };
}

function isAppBotSender(sender: WebhookPayload["sender"]): boolean {
  if (!sender) return false;
  if (sender.type !== "Bot") return false;
  const appName = config.integrations.github.appName;
  return sender.login === `${appName}[bot]`;
}

const INBOUND_ISSUE_ACTIONS = new Set(["opened", "edited", "labeled", "unlabeled", "closed", "reopened"]);
const INBOUND_DISCUSSION_ACTIONS = new Set([
  "created",
  "edited",
  "labeled",
  "unlabeled",
  "category_changed",
  "answered",
]);

function resolveRemoteId(event: string, payload: WebhookPayload): string | undefined {
  if (event === "issues" && payload.issue) return String(payload.issue.number);
  if (event === "discussion" && payload.discussion) return payload.discussion.node_id;
  if (event === "projects_v2_item" && payload.projects_v2_item) return payload.projects_v2_item.node_id;
  return undefined;
}

function shouldProcessEvent(event: string, action: string): boolean {
  if (event === "issues") return INBOUND_ISSUE_ACTIONS.has(action);
  if (event === "discussion") return INBOUND_DISCUSSION_ACTIONS.has(action);
  if (event === "projects_v2_item") return action === "edited" || action === "created";
  return false;
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

  if (event === "ping") {
    logger.info({ deliveryId }, "GitHub webhook ping received");
    return NextResponse.json({ ok: true });
  }

  if (isAppBotSender(payload.sender)) {
    logger.debug({ event, deliveryId }, "GitHub webhook skipped - sent by app bot");
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!payload.installation?.id) {
    logger.warn({ event }, "GitHub webhook missing installation ID");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const integration = await integrationRepo.findByGitHubInstallationId(payload.installation.id);

  if (!integration || !integration.enabled) {
    logger.debug(
      { event, installationId: payload.installation.id },
      "GitHub webhook - no matching enabled integration",
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!event || !shouldProcessEvent(event, payload.action)) {
    logger.debug({ event, action: payload.action }, "GitHub webhook - event/action not handled");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const remoteId = resolveRemoteId(event, payload);
  if (!remoteId) {
    logger.warn({ event, action: payload.action }, "GitHub webhook - could not resolve remoteId");
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Decrypt config and instantiate provider
  const rawConfig = integration.config as unknown as IntegrationConfig;
  const decryptedConfig: IntegrationConfig = {
    ...rawConfig,
    apiKey: rawConfig.apiKey ? decrypt(rawConfig.apiKey) : "",
  };

  // Skip if event source type doesn't match the integration's configured source
  const sourceType = decryptedConfig.sourceType ?? "issues";
  const expectedEvent =
    sourceType === "issues" ? "issues" : sourceType === "discussions" ? "discussion" : "projects_v2_item";
  if (event !== expectedEvent) {
    logger.debug(
      { event, sourceType, integrationId: integration.id },
      "GitHub webhook - event doesn't match integration source type",
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  logger.info({ event, action: payload.action, deliveryId, integrationId: integration.id }, "GitHub webhook applying");

  try {
    const provider = createIntegrationProvider("GITHUB", decryptedConfig);
    if (!provider.getInboundChange) {
      logger.warn({ sourceType }, "Provider doesn't support getInboundChange - webhook skipped");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const change = await provider.getInboundChange(remoteId);
    if (!change) {
      logger.warn({ remoteId, sourceType }, "GitHub webhook - remote item not found, skipping");
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Lock to prevent outbound-hook reentry while we apply the inbound change
    const existingMapping = await integrationMappingRepo.findByRemoteId(integration.id, remoteId);
    const postIdForLock = existingMapping?.localId;
    if (postIdForLock) await acquireSyncLock(postIdForLock);

    try {
      const apply = new ApplyInboundChange(integrationMappingRepo, integrationSyncLogRepo, postRepo);
      const result = await apply.execute({ change, integration, config: decryptedConfig });
      logger.info({ result, remoteId, deliveryId }, "GitHub webhook applied");
    } finally {
      if (postIdForLock) await releaseSyncLock(postIdForLock);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, event, remoteId }, "GitHub webhook processing failed");
    return NextResponse.json({ error: "Processing failed" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
