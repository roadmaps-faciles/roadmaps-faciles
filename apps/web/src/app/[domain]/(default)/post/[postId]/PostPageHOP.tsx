import { Bookmark, ExternalLink, MessageCircle } from "lucide-react";
import { type User } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactElement } from "react";
import { MarkdownAsync } from "react-markdown";

import { LikeButton } from "@/components/Board/LikeButton";
import { prisma } from "@/lib/db/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { integrationMappingRepo } from "@/lib/repo";
import { type Activity, type Board } from "@/prisma/client";
import { UserRole } from "@/prisma/enums";
import { UIBadge, UISeparator } from "@/ui/bridge";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { assertPublicAccess } from "@/utils/auth";
import { formatDate } from "@/utils/date";
import { reactMarkdownConfig } from "@/utils/react-markdown";

import { type EnrichedPost } from "../../board/[boardSlug]/actions";
import { DomainPageHOP } from "../../DomainPage";
import { uploadImage } from "../../upload-image";
import { PostTimeline } from "./_timeline/PostTimeline";
import { CommentForm } from "./CommentForm";
import { PostEditToggle } from "./PostEditToggle";

export interface PostPageParams {
  postId: number;
}

export const PostPageHOP = (page: (props: PostPageComponentProps) => ReactElement) =>
  DomainPageHOP<PostPageParams>()(async ({ params, _data: { settings, tenant, dirtyDomainFixer } }) => {
    const { postId } = await params;
    const id = Number(postId);
    if (isNaN(id)) {
      notFound();
    }

    await assertPublicAccess(settings, dirtyDomainFixer("/login"));

    // Parallelize independent data fetches for better performance
    const [post, session, anonymousId] = await Promise.all([
      prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          board: true,
          editedBy: true,
          likes: true,
          postStatus: true,
          user: true,
          activities: {
            orderBy: {
              startTime: "desc",
            },
            include: {
              comment: {
                include: {
                  user: true,
                  replies: {
                    take: 1,
                    orderBy: {
                      createdAt: "desc",
                    },
                    include: {
                      user: true,
                    },
                  },
                  _count: {
                    select: {
                      replies: true,
                    },
                  },
                },
              },
              statusChange: {
                include: {
                  postStatus: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              follows: true,
              activities: true,
            },
          },
        },
      }),
      auth(),
      getAnonymousId(),
    ]);

    if (!post) {
      notFound();
    }

    // Check membership once — used for both approval access and edit permissions
    const membership = session?.user
      ? await prisma.userOnTenant.findUnique({
          where: { userId_tenantId: { userId: session.user.uuid, tenantId: tenant.id } },
          select: { role: true },
        })
      : null;

    const isAdmin =
      session?.user?.isSuperAdmin ||
      (membership &&
        (membership.role === UserRole.ADMIN ||
          membership.role === UserRole.OWNER ||
          membership.role === UserRole.MODERATOR));

    // Non-approved posts are only visible to admins/moderators and the post author
    if (post.approvalStatus !== POST_APPROVAL_STATUS.APPROVED) {
      const isAuthor =
        (session?.user && post.userId && post.userId === session.user.uuid) ||
        (post.anonymousId && post.anonymousId === anonymousId);
      if (!isAdmin && !isAuthor) {
        notFound();
      }
    }

    const alreadyLiked = post.likes.some(like => session?.user.id === like.userId || like.anonymousId === anonymousId);

    // Fetch integration mapping for "View on Notion" link (only if feature enabled)
    const integrationsEnabled = await isFeatureEnabled("integrations", session);
    const postMappings = integrationsEnabled ? await integrationMappingRepo.findMappingsForPost(post.id) : [];
    const notionMapping = postMappings.find(m => m.remoteUrl);
    const inboundMapping = postMappings.find(
      m => m.metadata && (m.metadata as Record<string, unknown>).direction === "inbound",
    );
    const isInbound = !!inboundMapping;

    // Inbound-only integrations: post is fully read-only (no edits, no votes, no comments)
    const isInboundOnly =
      isInbound && (inboundMapping.integration.config as Record<string, unknown>)?.syncDirection === "inbound";

    let canEdit = false;
    let canDelete = false;
    if (session?.user && !isInboundOnly) {
      const isAuthor = post.userId && post.userId === session.user.uuid;
      if (isAuthor && settings.allowPostEdits) {
        canEdit = true;
      } else if (isAdmin) {
        canEdit = true;
      }
      if (isAdmin) {
        canDelete = true;
      } else if (isAuthor && settings.allowPostDeletion) {
        canDelete = true;
      }
    }

    return page({
      post,
      user: session?.user,
      userId: session?.user.uuid,
      anonymousId,
      alreadyLiked,
      canEdit,
      canDelete,
      isAdmin: Boolean(isAdmin),
      boardSlug: post.board.slug ?? "",
      allowVoting: isInboundOnly ? false : settings.allowVoting,
      allowAnonymousVoting: isInboundOnly ? false : settings.allowAnonymousVoting,
      allowComments: isInboundOnly ? false : settings.allowComments,
      notionUrl: isAdmin && notionMapping ? notionMapping.remoteUrl : undefined,
    });
  });

export interface PostPageComponentProps {
  allowAnonymousVoting: boolean;
  allowComments: boolean;
  allowVoting: boolean;
  alreadyLiked: boolean;
  anonymousId: string;
  boardSlug: string;
  canDelete: boolean;
  canEdit: boolean;
  isAdmin: boolean;
  isModal?: boolean;
  notionUrl?: null | string;
  post: { activities: Activity[]; board: Board; editedBy?: { name: null | string } | null } & EnrichedPost;
  user?: null | User;
  userId?: string;
}

export const PostPageComponent = async (props: PostPageComponentProps) => {
  const { post, allowComments, canEdit, canDelete, boardSlug, isModal, notionUrl } = props;
  const [t, locale] = await Promise.all([getTranslations("post"), getLocale()]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {post.postStatus ? (
          <UIBadge variant="outline">{post.postStatus.name}</UIBadge>
        ) : (
          <UIBadge variant="secondary">{t("unclassified")}</UIBadge>
        )}
        <UIBadge>{post.board.name}</UIBadge>
        {post.tags?.map(tag => (
          <UIBadge key={tag} variant="outline" className="gap-1">
            <Bookmark className="size-3" />
            {tag}
          </UIBadge>
        ))}
        {notionUrl && (
          <a href={notionUrl} target="_blank" rel="noopener noreferrer">
            <UIBadge variant="secondary" className="gap-1">
              <ExternalLink className="size-3" />
              {t("viewOnNotion")}
            </UIBadge>
          </a>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t.rich("addedBy", {
          author: post.user?.name ?? post.sourceLabel ?? t("anonymous"),
          date: formatDate(post.createdAt, locale),
          b: chunks => <b>{chunks}</b>,
        })}
        {post.editedAt && (
          <>
            {" "}
            <span className="text-xs text-muted-foreground/70">
              {post.editedBy?.name ? t("editedBy", { editor: post.editedBy.name }) : t("edited")}
            </span>
          </>
        )}
      </p>
      <PostEditToggle
        canEdit={canEdit}
        canDelete={canDelete}
        boardSlug={boardSlug}
        isModal={isModal}
        postId={post.id}
        title={post.title}
        description={post.description}
      >
        <div className="prose prose-sm mt-4 max-w-none dark:prose-invert">
          <MarkdownAsync {...reactMarkdownConfig}>{post.description}</MarkdownAsync>
        </div>
      </PostEditToggle>
      {allowComments && (
        <CommentForm postId={post.id} tenantId={post.tenantId} userId={props.userId} uploadImageAction={uploadImage} />
      )}
      {isModal ? (
        <>
          {post._count.comments > 0 && (
            <UIBadge variant="secondary" className="gap-1">
              <MessageCircle className="size-3" />
              {t.rich("comment", { count: post._count.comments, b: chunks => <b>{chunks}</b> })}
            </UIBadge>
          )}
        </>
      ) : (
        <>
          <div className="relative my-6">
            <UISeparator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-background px-3 text-sm text-muted-foreground">
              {t("activityFeed")}
            </span>
          </div>

          <PostTimeline {...props} />
        </>
      )}
    </>
  );
};

export const PostPageTitle = ({
  post,
  alreadyLiked,
  allowVoting,
  allowAnonymousVoting,
  user,
}: PostPageComponentProps) => (
  <span className="relative z-[1] flex justify-between items-center gap-[2rem]">
    <MarkdownAsync {...reactMarkdownConfig}>{post.title}</MarkdownAsync>
    {allowVoting && (allowAnonymousVoting || user?.id) && (
      <LikeButton alreadyLiked={alreadyLiked} postId={post.id} tenantId={post.tenantId} userId={user?.id}>
        {post._count.likes}
      </LikeButton>
    )}
  </span>
);
