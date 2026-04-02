import { cn } from "@roadmaps-faciles/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import z from "zod";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { TrackPageView } from "@/lib/ee/tracking-provider";
import { embedViewed } from "@/lib/ee/tracking-provider/trackingPlan";
import { auth } from "@/lib/next-auth/auth";
import { UIAlert } from "@/ui/bridge";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { getTenantFromDomain } from "@/utils/tenant";

import { type EnrichedPost, fetchPostsForBoard } from "../../../../(default)/board/[boardSlug]/actions";
import { PostList } from "../../../../(default)/board/[boardSlug]/PostList";
import { PostListCompact } from "../../../../(default)/board/[boardSlug]/PostListCompact";
import { defaultOrder, defaultView, ORDER_ENUM, VIEW_ENUM } from "../../../../(default)/board/[boardSlug]/types";

const searchParamsSchema = z.object({
  hideVotes: z.coerce.boolean().default(false),
  order: z.enum(ORDER_ENUM).default(defaultOrder),
  search: z.string().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  view: z.enum(VIEW_ENUM).default(defaultView),
});

interface EmbedBoardPageProps {
  params: Promise<{ boardSlug: string; domain: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

const EmbedBoardPageInner = async ({ params, searchParams }: EmbedBoardPageProps) => {
  await connection();

  const { domain, boardSlug } = await params;
  const rawSearchParams = await searchParams;
  const parsed = searchParamsSchema.safeParse(rawSearchParams);
  const { order, view, hideVotes, search } = parsed.success
    ? parsed.data
    : { order: defaultOrder, view: defaultView, hideVotes: false, search: undefined };

  const tenant = await getTenantFromDomain(domain);
  const tenantSettings = await prisma.tenantSettings.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!tenantSettings) {
    return null;
  }

  const [t, session, anonymousId] = await Promise.all([getTranslations("embed"), auth(), getAnonymousId()]);

  // Handle private tenants: show message instead of redirecting
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

  const board = await prisma.board.findUnique({
    where: {
      slug_tenantId: {
        slug: boardSlug,
        tenantId: tenant.id,
      },
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  const [tb, tc] = await Promise.all([getTranslations("board"), getTranslations("common")]);

  if (!board) {
    return (
      <div className="py-8 px-4">
        <p>{tb("boardNotFound")}</p>
      </div>
    );
  }

  const { posts, filteredCount } = await fetchPostsForBoard(1, order, board.id, search);

  const allowVoting = hideVotes ? false : tenantSettings.allowVoting;
  const allowAnonymousVoting = hideVotes ? false : tenantSettings.allowAnonymousVoting;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <TrackPageView event={embedViewed({ boardId: String(board.id), tenantId: String(tenant.id) })} />
      <h2 className="text-lg font-bold mb-2">{board.name}</h2>
      <p className={cn("text-sm text-muted-foreground mb-4")}>{tc("result", { count: filteredCount })}</p>
      <ClientAnimate className="flex flex-col gap-4">
        {view === "list" ? (
          <PostListCompact
            key={`embed_compact_${board.id}_${order}_${search ?? ""}`}
            allowAnonymousVoting={allowAnonymousVoting}
            allowVoting={allowVoting}
            anonymousId={anonymousId}
            initialPosts={posts as EnrichedPost[]}
            totalCount={filteredCount}
            userId={session?.user.id}
            order={order}
            boardId={board.id}
            search={search}
            linkTarget="_blank"
          />
        ) : (
          <PostList
            key={`embed_cards_${board.id}_${order}_${search ?? ""}`}
            allowAnonymousVoting={allowAnonymousVoting}
            allowVoting={allowVoting}
            anonymousId={anonymousId}
            initialPosts={posts as EnrichedPost[]}
            totalCount={filteredCount}
            userId={session?.user.id}
            order={order}
            boardId={board.id}
            search={search}
            boardSlug={boardSlug}
            linkTarget="_blank"
          />
        )}
      </ClientAnimate>
    </div>
  );
};

const EmbedBoardPage = (props: EmbedBoardPageProps) => (
  <Suspense>
    <EmbedBoardPageInner {...props} />
  </Suspense>
);

export default EmbedBoardPage;
