"use client";

import { useTranslations } from "next-intl";

import { type PublicMappingSummary } from "@/lib/repo/IIntegrationMappingRepo";
import { type IntegrationType } from "@/prisma/enums";

interface RemoteStatsBadgeProps {
  mappings: PublicMappingSummary[];
}

const PROVIDER_LABEL: Record<IntegrationType, string> = {
  GITHUB: "GitHub",
  NOTION: "Notion",
};

function extractStats(
  metadata: PublicMappingSummary["metadata"],
): { commentCount?: number; reactionCount?: number } | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const obj = metadata as Record<string, unknown>;
  const remoteStats = obj.remoteStats;
  if (!remoteStats || typeof remoteStats !== "object") return null;
  return remoteStats;
}

export const RemoteStatsBadge = ({ mappings }: RemoteStatsBadgeProps) => {
  const t = useTranslations("post.remoteStats");

  const renderable = mappings.filter(m => {
    const stats = extractStats(m.metadata);
    return Boolean(m.remoteUrl) || stats?.reactionCount !== undefined || stats?.commentCount !== undefined;
  });

  if (renderable.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {renderable.map((mapping, i) => {
        const stats = extractStats(mapping.metadata);
        const label = PROVIDER_LABEL[mapping.integrationType];
        const reactionCount = stats?.reactionCount;
        const commentCount = stats?.commentCount;

        return (
          <span key={i} className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{label}</span>
            {reactionCount !== undefined && (
              <span aria-label={t("reactions")}>
                <span aria-hidden>👍</span> {reactionCount}
              </span>
            )}
            {commentCount !== undefined && (
              <span aria-label={t("comments")}>
                <span aria-hidden>💬</span> {commentCount}
              </span>
            )}
            {mapping.remoteUrl && (
              <a href={mapping.remoteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {t("viewOn", { provider: label })}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
};
