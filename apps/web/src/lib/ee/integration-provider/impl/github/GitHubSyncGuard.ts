import "server-only";

import { redis } from "@/lib/db/redis/storage";

const LOCK_PREFIX = "github-sync-lock";
const LOCK_TTL_SECONDS = 30;

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
