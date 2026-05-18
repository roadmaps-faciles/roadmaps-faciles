import { cn } from "@roadmaps-faciles/ui";
import { MarkdownHooks } from "react-markdown";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkGfm from "remark-gfm";

import { type EnrichedPost } from "@/app/[domain]/(default)/board/[boardSlug]/actions";
import { UIBadge, UICard, UITag } from "@/ui/bridge";

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
  return (
    <UICard
      className={cn(!first && "snap-start scroll-mt-38")}
      title={post.title}
      href={dirtyDomainFixer(`/post/${post.id}`)}
      linkTarget={linkTarget}
      titleAs="h3"
      footer={
        <span className="flex flex-col gap-1 w-full">
          <span className="flex justify-between items-center w-full">
            <span>
              {post.user?.name ?? post.sourceLabel ?? "Anonyme"}
              {post.editedAt && <span className="text-xs font-light ml-1">(modifié)</span>}
            </span>
            {post._count.comments > 0 && (
              <UITag
                className="cursor-pointer"
                iconId="fr-icon-discuss-line"
                as="span"
                size="sm"
                onClick={() => {
                  const url = dirtyDomainFixer(`/post/${post.id}`);
                  if (linkTarget) {
                    window.open(url, linkTarget, "noopener,noreferrer");
                  } else {
                    location.href = url;
                  }
                }}
              >
                <b>{post._count.comments}</b>&nbsp;commentaire{post._count.comments > 1 ? "s" : ""}
              </UITag>
            )}
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
