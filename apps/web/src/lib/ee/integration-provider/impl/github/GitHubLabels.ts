import "server-only";
import { type Octokit } from "octokit";

const LABEL_PREFIX = "roadmaps-faciles";
const STATUS_PREFIX = `${LABEL_PREFIX}:status`;
const BOARD_PREFIX = `${LABEL_PREFIX}:board`;
export const MANAGED_LABEL = `${LABEL_PREFIX}:managed`;

const STATUS_COLOR = "0075ca";
const BOARD_COLOR = "e4e669";
const MANAGED_COLOR = "5319e7";

export function buildStatusLabel(statusName: string): string {
  return `${STATUS_PREFIX}:${statusName}`;
}

export function buildBoardLabel(boardName: string): string {
  return `${BOARD_PREFIX}:${boardName}`;
}

export function parseStatusLabel(label: string): string | undefined {
  if (label.startsWith(`${STATUS_PREFIX}:`)) {
    return label.slice(STATUS_PREFIX.length + 1);
  }
  return undefined;
}

export function parseBoardLabel(label: string): string | undefined {
  if (label.startsWith(`${BOARD_PREFIX}:`)) {
    return label.slice(BOARD_PREFIX.length + 1);
  }
  return undefined;
}

export function isManagedLabel(label: string): boolean {
  return label === MANAGED_LABEL;
}

export function isRoadmapsFacilesLabel(label: string): boolean {
  return label.startsWith(`${LABEL_PREFIX}:`);
}

export async function ensureLabel(
  octokit: Octokit,
  owner: string,
  repo: string,
  name: string,
  color: string,
): Promise<void> {
  try {
    await octokit.rest.issues.getLabel({ owner, repo, name });
  } catch {
    await octokit.rest.issues.createLabel({ owner, repo, name, color });
  }
}

export async function ensureStatusLabels(
  octokit: Octokit,
  owner: string,
  repo: string,
  statusNames: string[],
): Promise<void> {
  await ensureLabel(octokit, owner, repo, MANAGED_LABEL, MANAGED_COLOR);
  for (const name of statusNames) {
    await ensureLabel(octokit, owner, repo, buildStatusLabel(name), STATUS_COLOR);
  }
}

export async function ensureBoardLabels(
  octokit: Octokit,
  owner: string,
  repo: string,
  boardNames: string[],
): Promise<void> {
  for (const name of boardNames) {
    await ensureLabel(octokit, owner, repo, buildBoardLabel(name), BOARD_COLOR);
  }
}
