import { cn } from "@roadmaps-faciles/ui";
import { useLocale } from "next-intl";
import { MarkdownHooks } from "react-markdown";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkGfm from "remark-gfm";

import { type EnrichedPost } from "@/app/[domain]/(default)/board/[boardSlug]/actions";
import { useUI } from "@/ui";
import { UIBadge, UICard, UITag } from "@/ui/bridge";
import { formatRelativeDate } from "@/utils/date";

import { LikeButton } from "./LikeButton";
import { RemoteStatsBadge } from "./RemoteStatsBadge";

export interface BoardPostProps {
  allowAnonymousVoting?: boolean;
  allowVoting?: boolean;
  alreadyLiked: boolean;
  boardSlug: string;
  dirtyDomainFixer: (pathname: string) => string;
  first?: boolean;
  linkTarget?: string;
  post: EnrichedPost;
  userId?: string;
}

export const BoardPost = ({
  post,
  alreadyLiked,
  allowAnonymousVoting = true,
  allowVoting = true,
  userId,
  first,
  dirtyDomainFixer,
  linkTarget,
}: BoardPostProps) => {
  const locale = useLocale();
  const isDsfr = useUI() === "Dsfr";

  return (
    <UICard
      wrapperClassName={cn(!first && "scroll-mt-[var(--header-scroll-offset)]")}
      title={post.title}
      href={dirtyDomainFixer(`/post/${post.id}`)}
      linkTarget={linkTarget}
      titleAs="h3"
      footer={
        <span
          className={cn(
            "flex flex-col gap-1 py-2 text-xs",
            isDsfr
              ? "-mx-8 -mb-px w-[calc(100%+4rem)] px-8 bg-[var(--background-contrast-grey)] text-[var(--text-mention-grey)]"
              : "-mx-3 -mb-3 w-[calc(100%+1.5rem)] rounded-b-xl bg-muted/50 px-3 text-muted-foreground",
          )}
        >
          <span className="flex items-center justify-between">
            <span className="truncate">
              {post.user?.name ?? post.sourceLabel ?? "Anonyme"}
              <span className="mx-1">·</span>
              {formatRelativeDate(new Date(post.createdAt), locale)}
              {post.editedAt && <span className="ml-1 font-light">(modifié)</span>}
            </span>
            <UITag
              className={cn(
                "shrink-0",
                isDsfr ? "!bg-[var(--background-default-grey)]" : "!bg-background",
                post._count.comments > 0 ? "cursor-pointer" : "opacity-50",
              )}
              iconId="fr-icon-discuss-line"
              as="span"
              size="sm"
              onClick={post._count.comments > 0 ? () => {
                const url = dirtyDomainFixer(`/post/${post.id}`);
                if (linkTarget) {
                  window.open(url, linkTarget, "noopener,noreferrer");
                } else {
                  location.href = url;
                }
              } : undefined}
            >
              {post._count.comments > 0 ? (
                <><b>{post._count.comments}</b>&nbsp;commentaire{post._count.comments > 1 ? "s" : ""}</>
              ) : (
                <>Aucun commentaire</>
              )}
            </UITag>
          </span>
          {post.remoteMappings && post.remoteMappings.length > 0 && <RemoteStatsBadge mappings={post.remoteMappings} />}
        </span>
      }
      subtitle={
        <span className="flex gap-2 items-center">
          {post.postStatus ? (
            <UIBadge size="sm" statusColor={post.postStatus.color}>
              {post.postStatus.name}
            </UIBadge>
          ) : (
            <UIBadge size="sm" statusColor="grey">
              Non classé
            </UIBadge>
          )}
          {post.tags?.map(tag => (
            <UITag as="span" key={tag} size="sm">
              {tag}
            </UITag>
          ))}
        </span>
      }
      description={
        <span className="flex gap-2 items-center">
          {allowVoting && (allowAnonymousVoting || userId) && (
            <LikeButton alreadyLiked={alreadyLiked} postId={post.id} tenantId={post.tenantId} userId={userId}>
              {post._count.likes}
            </LikeButton>
          )}
          <span className="line-clamp-3">
            {post.description && (
              <MarkdownHooks
                remarkPlugins={[remarkGfm, remarkDirective, remarkDirectiveRehype]}
                unwrapDisallowed
                disallowedElements={["p"]}
                allowElement={elt => elt.tagName !== "p"}
                components={{
                  ["search-mark" as "div"]: ({ children }) => {
                    return <mark>{children}</mark>;
                  },
                }}
              >
                {post.description}
              </MarkdownHooks>
            )}
          </span>
        </span>
      }
      horizontal
      size="sm"
      shadow="dark"
    />
  );
};
