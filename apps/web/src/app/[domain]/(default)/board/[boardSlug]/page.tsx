import { cn } from "@roadmaps-faciles/ui";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import z from "zod";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { prisma } from "@/lib/db/prisma";
import { TrackPageView } from "@/lib/ee/tracking-provider";
import { boardPublicViewed, boardViewed } from "@/lib/ee/tracking-provider/trackingPlan";
import { auth } from "@/lib/next-auth/auth";
import { UIContainer, UIGrid, UIGridCol } from "@/ui/bridge";
import { getTheme } from "@/ui/server";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { assertPublicAccess } from "@/utils/auth";
import { generateBoardMetadata } from "@/utils/metadata";
import { withValidation } from "@/utils/next";

import { type DomainPageCombinedProps, DomainPageHOP } from "../../DomainPage";
import { type EnrichedPost, fetchPostsForBoard } from "./actions";
import style from "./Board.module.scss";
import { FilterAndSearch } from "./FilterAndSearch";
// TODO: réactiver quand les wireframes kanban seront implémentés
// import { PostKanban } from "./PostKanban";
// import { PostKanbanAccordion } from "./PostKanbanAccordion";
import { PostList } from "./PostList";
import { PostListCompact } from "./PostListCompact";
import { SubmitPostForm } from "./SubmitPostForm";
import { defaultOrder, defaultView, ORDER_ENUM, VIEW_ENUM } from "./types";

export interface BoardPageParams {
  boardSlug: string;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ boardSlug: string; domain: string }>;
}): Promise<Metadata> => {
  const { domain, boardSlug } = await params;
  return generateBoardMetadata(domain, boardSlug);
};

const searchParamsSchema = z.object({
  order: z.enum(ORDER_ENUM).default(defaultOrder),
  search: z.string().optional(),
  view: z.enum(VIEW_ENUM).default(defaultView),
});

const BoardPage = withValidation({
  searchParamsSchema,
})(async ({ searchParams, searchParamsError, ...rest }) => {
  const { _data, params } = rest as DomainPageCombinedProps<BoardPageParams>;
  const { order, search, view } = await searchParams;

  await assertPublicAccess(_data.settings, _data.dirtyDomainFixer("/login"));

  const validatedOrder = searchParamsError?.properties?.order?.errors.length ? defaultOrder : order;
  const validatedView = searchParamsError?.properties?.view?.errors.length ? defaultView : view;
  const { boardSlug } = await params;

  const [session, board, anonymousId] = await Promise.all([
    auth(),
    prisma.board.findUnique({
      where: {
        slug_tenantId: {
          slug: boardSlug,
          tenantId: _data.tenant.id,
        },
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),
    getAnonymousId(),
  ]);

  const t = await getTranslations();

  if (!board) {
    return <div>{t("board.boardNotFound")}</div>;
  }

  const { posts, filteredCount } = await fetchPostsForBoard(1, validatedOrder, board.id, search);

  const showSuggestionForm = _data.settings.allowAnonymousFeedback || !!session;

  const boardTrackEvent = session
    ? boardViewed({ boardId: String(board.id), tenantId: String(_data.tenant.id) })
    : boardPublicViewed({ boardId: String(board.id), tenantId: String(_data.tenant.id) });

  const isDsfr = (await getTheme(_data.settings)) === "Dsfr";

  const sharedPostProps = {
    allowAnonymousVoting: _data.settings.allowAnonymousVoting,
    allowVoting: _data.settings.allowVoting,
    anonymousId,
    initialPosts: posts as EnrichedPost[],
    totalCount: filteredCount,
    userId: session?.user.id,
    order: validatedOrder,
    boardId: board.id,
    search,
  };

  return (
    <>
      <TrackPageView event={boardTrackEvent} />
      <UIContainer className="my-4">
        <UIGrid gap>
          {showSuggestionForm && (
            <UIGridCol span={3} className={cn("sticky self-start top-0", isDsfr && style.sidebar)}>
              <div className={isDsfr ? style.suggestionForm : "px-4 rounded-lg border bg-card shadow-sm"}>
                <SubmitPostForm boardId={board.id} />
              </div>
            </UIGridCol>
          )}
          <UIGridCol span={showSuggestionForm ? 9 : 12}>
            <UIGrid
              className={cn(
                "sticky self-start z-501",
                isDsfr ? style.header : "top-0 bg-background border-b shadow-sm",
              )}
            >
              <UIGridCol span={8} className="pr-2">
                <h1 className={isDsfr ? "fr-mb-1w fr-h3" : "mb-1 text-xl font-bold"}>{board.name}</h1>
                {board.description && (
                  <div className={cn(isDsfr ? "fr-text--md" : "max-w-none prose prose-sm", style.boardSubTiltle)}>
                    <MDXRemote source={board.description} />
                  </div>
                )}
              </UIGridCol>
              <UIGridCol span={4}>
                <FilterAndSearch order={validatedOrder} search={search} view={validatedView} />
              </UIGridCol>
              <UIGridCol span={12} className={isDsfr ? "fr-hint-text" : "mt-2 text-sm text-muted-foreground"}>
                {t("common.result", { count: filteredCount })}
                {filteredCount !== board._count.posts
                  ? ` ${t("common.filteredOf", { count: filteredCount, total: board._count.posts })}`
                  : ""}
              </UIGridCol>
            </UIGrid>
            <ClientAnimate className="flex flex-col gap-4">
              {/* TODO: réactiver kanban et kanban-accordion quand les wireframes seront implémentés */}
              {validatedView === "list" ? (
                <PostListCompact key={`compact_${board.id}_${validatedOrder}_${search ?? ""}`} {...sharedPostProps} />
              ) : (
                <PostList
                  key={`cards_${board.id}_${validatedOrder}_${search ?? ""}`}
                  {...sharedPostProps}
                  boardSlug={boardSlug}
                />
              )}
            </ClientAnimate>
          </UIGridCol>
        </UIGrid>
      </UIContainer>
    </>
  );
});

export default DomainPageHOP()(BoardPage);
