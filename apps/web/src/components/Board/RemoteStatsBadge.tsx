import { type IntegrationMappingWithIntegration } from "@/lib/repo/IIntegrationMappingRepo";
import { type IntegrationType } from "@/prisma/enums";

interface RemoteStatsBadgeProps {
  mappings: IntegrationMappingWithIntegration[];
}

const PROVIDER_LABEL: Record<IntegrationType, string> = {
  GITHUB: "GitHub",
  NOTION: "Notion",
};

export const RemoteStatsBadge = ({ mappings }: RemoteStatsBadgeProps) => {
  if (mappings.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {mappings.map((mapping, i) => {
        const stats =
          mapping.metadata && typeof mapping.metadata === "object" && "remoteStats" in mapping.metadata
            ? (mapping.metadata.remoteStats as { commentCount?: number; reactionCount?: number } | null)
            : null;
        const label = PROVIDER_LABEL[mapping.integration.type];
        const reactionCount = stats?.reactionCount;
        const commentCount = stats?.commentCount;

        return (
          <span key={i} className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{label}</span>
            {reactionCount !== undefined && (
              <span aria-label="reactions">
                <span aria-hidden>👍</span> {reactionCount}
              </span>
            )}
            {commentCount !== undefined && (
              <span aria-label="commentaires">
                <span aria-hidden>💬</span> {commentCount}
              </span>
            )}
            {mapping.remoteUrl && (
              <a href={mapping.remoteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                voir sur {label}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
};
