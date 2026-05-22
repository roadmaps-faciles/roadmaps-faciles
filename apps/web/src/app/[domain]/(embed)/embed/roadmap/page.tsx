import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import z from "zod";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { UIAlert } from "@/ui/bridge";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { getDirtyDomain } from "@/utils/dirtyDomain/getDirtyDomain";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";
import { getTenantFromDomain } from "@/utils/tenant";

import { RoadmapBoard } from "../../../(default)/roadmap/RoadmapBoard";

const searchParamsSchema = z.object({
  hideVotes: z.coerce.boolean().default(false),
  theme: z.enum(["dark", "light"]).optional(),
});

interface EmbedRoadmapPageProps {
  params: Promise<{ domain: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

const EmbedRoadmapPageInner = async ({ params, searchParams }: EmbedRoadmapPageProps) => {
  await connection();

  const { domain } = await params;
  const rawSearchParams = await searchParams;
  const parsed = searchParamsSchema.safeParse(rawSearchParams);
  const { hideVotes } = parsed.success ? parsed.data : { hideVotes: false };

  const tenant = await getTenantFromDomain(domain);
  const tenantSettings = await prisma.tenantSettings.findFirst({ where: { tenantId: tenant.id } });

  if (!tenantSettings) {
    return null;
  }

  const [t, tr, session, anonymousId, dirtyDomain] = await Promise.all([
    getTranslations("embed"),
    getTranslations("roadmap"),
    auth(),
    getAnonymousId(),
    getDirtyDomain(),
  ]);

  if (tenantSettings.isPrivate && !session?.user) {
    const tenantUrl = tenantSettings.customDomain
      ? `https://${tenantSettings.customDomain}`
      : `${config.host.replace("://", `://${tenantSettings.subdomain}.`)}`;

    return (
      <div className="py-8 px-4">
        <UIAlert
          variant="warning"
          title={t("privateTenant")}
          description={
            <Link href={`${tenantUrl}/login`} target="_blank" className="text-primary underline">
              {t("privateTenantLogin")}
            </Link>
          }
        />
      </div>
    );
  }

  const dirtyDomainFixer = dirtyDomain ? dirtySafePathname(dirtyDomain) : (pathname: string) => pathname;
  const userId = session?.user.id;
  const showVotes = !hideVotes && tenantSettings.allowVoting && (tenantSettings.allowAnonymousVoting || !!userId);

  const [postStatuses, posts] = await Promise.all([
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

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="sr-only">{tr("title")}</h2>
      <RoadmapBoard
        posts={postCardsData}
        columns={columns}
        availableTags={availableTags}
        showVotes={showVotes}
        tenantId={tenant.id}
        userId={userId}
        emptyMessage={tr("emptyColumn")}
      />
    </div>
  );
};

const EmbedRoadmapPage = (props: EmbedRoadmapPageProps) => (
  <Suspense>
    <EmbedRoadmapPageInner {...props} />
  </Suspense>
);

export default EmbedRoadmapPage;
