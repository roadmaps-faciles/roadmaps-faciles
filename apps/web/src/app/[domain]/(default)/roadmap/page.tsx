import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { userOnTenantRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import { UIAlert } from "@/ui/bridge";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { assertPublicAccess } from "@/utils/auth";

import { DomainPageHOP } from "../DomainPage";
import { RoadmapBoard } from "./RoadmapBoard";
import { RoadmapHero } from "./RoadmapHero";

const RoadmapPage = DomainPageHOP()(async props => {
  const { tenant, settings, dirtyDomainFixer } = props._data;
  await assertPublicAccess(settings, dirtyDomainFixer("/login"));

  const [anonymousId, session, t] = await Promise.all([getAnonymousId(), auth(), getTranslations("roadmap")]);

  const userId = session?.user.id;
  const showVotes = settings.allowVoting && (settings.allowAnonymousVoting || !!userId);

  const [postStatuses, posts, rootBoard] = await Promise.all([
    prisma.postStatus.findMany({
      where: { tenantId: tenant.id, showInRoadmap: true },
      orderBy: { order: "asc" },
    }),
    prisma.post.findMany({
      where: {
        tenantId: tenant.id,
        postStatusId: { not: null },
        approvalStatus: POST_APPROVAL_STATUS.APPROVED,
        postStatus: { showInRoadmap: true },
      },
      orderBy: { likes: { _count: "desc" } },
      include: {
        postStatus: true,
        board: { select: { id: true, name: true, slug: true } },
        likes: { select: { userId: true, anonymousId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    settings.rootBoardId
      ? prisma.board.findUnique({ where: { id: settings.rootBoardId }, select: { id: true, slug: true } })
      : Promise.resolve(null),
  ]);

  const postIds = posts.map(p => p.id);
  const statusChanges = postIds.length
    ? await prisma.postStatusChange.findMany({
        where: { tenantId: tenant.id, postId: { in: postIds } },
        orderBy: { createdAt: "desc" },
        select: { postId: true, postStatusId: true, createdAt: true },
      })
    : [];
  const latestStatusChangeByPost = new Map<number, { postStatusId: null | number; createdAt: Date }>();
  for (const change of statusChanges) {
    if (!latestStatusChangeByPost.has(change.postId)) {
      latestStatusChangeByPost.set(change.postId, change);
    }
  }

  const membership = userId ? await userOnTenantRepo.findMembership(userId, tenant.id) : null;
  const isAdmin = !!(
    session?.user.isSuperAdmin ||
    membership?.role === UserRole.ADMIN ||
    membership?.role === UserRole.OWNER
  );
  const showAdminHint = isAdmin && postStatuses.length === 0 && posts.length > 0;

  const SUCCESS_COLORS = new Set([
    "greenTilleulVerveine",
    "greenBourgeon",
    "greenEmeraude",
    "greenMenthe",
    "greenArchipel",
    "success",
  ]);

  const postCardsData = posts.map(post => {
    const change = latestStatusChangeByPost.get(post.id);
    const isShippedColor = post.postStatus ? SUCCESS_COLORS.has(post.postStatus.color) : false;
    const shippedAt = isShippedColor && change && change.postStatusId === post.postStatusId ? change.createdAt : null;

    return {
      id: post.id,
      title: post.title,
      description: post.description,
      tags: post.tags,
      progress: post.progress,
      eta: post.eta,
      shippedAt,
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      alreadyLiked: post.likes.some(l => (userId && l.userId === userId) || l.anonymousId === anonymousId),
      boardName: post.board.name,
      statusColor: post.postStatus?.color ?? null,
      statusName: post.postStatus?.name ?? null,
      postStatusId: post.postStatusId,
      createdAt: post.createdAt,
      postUrl: dirtyDomainFixer(`/post/${post.id}`),
    };
  });

  const columns = postStatuses.map(s => ({ id: s.id, name: s.name, color: s.color }));

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const availableTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  const stats = postStatuses.map(s => ({
    label: s.name,
    value: postCardsData.filter(p => p.postStatusId === s.id).length,
  }));

  const suggestUrl = rootBoard?.slug ? dirtyDomainFixer(`/board/${rootBoard.slug}`) : null;

  return (
    <div className="flex-1 flex flex-col">
      <RoadmapHero tenantName={settings.name} suggestUrl={suggestUrl} stats={stats} />

      {showAdminHint && (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-6 w-full">
          <UIAlert
            variant="warning"
            description={
              <>
                {t("adminNoStatusHint", { count: posts.length })}{" "}
                <a href={dirtyDomainFixer("/admin/statuses")}>{t("adminNoStatusLink")}</a>
              </>
            }
          />
        </div>
      )}

      {postStatuses.length === 0 && !showAdminHint ? (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-6 w-full">
          <UIAlert variant="default" description={t("empty")} />
        </div>
      ) : (
        <RoadmapBoard
          posts={postCardsData}
          columns={columns}
          availableTags={availableTags}
          showVotes={showVotes}
          tenantId={tenant.id}
          userId={userId}
          emptyMessage={t("emptyColumn")}
        />
      )}
    </div>
  );
});

export default RoadmapPage;
