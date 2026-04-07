import "server-only";

import { redis } from "@/lib/db/redis/storage";

const LOCK_PREFIX = "github-sync-lock";
const LOCK_TTL_SECONDS = 30;

/**
 * Checks if a webhook event should be processed, by verifying the sender is
 * not the GitHub App bot itself (primary guard).
 *
 * GitHub webhook payloads include a `sender` object. When the App modifies an
 * issue (outbound sync), the resulting webhook has `sender.type === "Bot"` and
 * the sender ID matches the App's bot user. We skip those events.
 */
export function isAppBotSender(senderId: number, appBotId: number): boolean {
  return senderId === appBotId;
}

/**
 * Secondary guard: sets a short-lived Redis lock when processing a webhook
 * inbound update. The outbound hook checks this lock before pushing changes,
 * preventing the rare case where the sender check isn't sufficient.
 */
export async function acquireSyncLock(postId: number): Promise<void> {
  const key = `${LOCK_PREFIX}:${postId}`;
  await redis.setItem(key, "1", { ttl: LOCK_TTL_SECONDS });
}

export async function isSyncLocked(postId: number): Promise<boolean> {
  const key = `${LOCK_PREFIX}:${postId}`;
  const value = await redis.getItem(key);
  return value !== null;
}

export async function releaseSyncLock(postId: number): Promise<void> {
  const key = `${LOCK_PREFIX}:${postId}`;
  await redis.removeItem(key);
}
