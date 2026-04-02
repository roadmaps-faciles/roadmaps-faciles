import { cn } from "@roadmaps-faciles/ui";
import { getTranslations } from "next-intl/server";

import { LikeButton } from "@/components/Board/LikeButton";
import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { userOnTenantRepo } from "@/lib/repo";
import { UserRole } from "@/prisma/enums";
import { UIAlert, UICard, UITag } from "@/ui/bridge";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { assertPublicAccess } from "@/utils/auth";

import { DomainPageHOP } from "../DomainPage";

const RoadmapPage = DomainPageHOP()(async props => {
  const { tenant, settings, dirtyDomainFixer } = props._data;
  await assertPublicAccess(settings, dirtyDomainFixer("/login"));
  const anonymousId = await getAnonymousId();
  const session = await auth();
  const userId = session?.user.id;
  const showVotes = settings.allowVoting && (settings.allowAnonymousVoting || !!userId);

  const postStatuses = await prisma.postStatus.findMany({
    where: {
      tenantId: tenant.id,
      showInRoadmap: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      tenantId: tenant.id,
      postStatusId: {
        not: null,
      },
      approvalStatus: POST_APPROVAL_STATUS.APPROVED,
    },
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
    include: {
      postStatus: true,
      board: true,
      likes: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  // Check if current user is tenant admin (for admin hints)
  const membership = userId ? await userOnTenantRepo.findMembership(userId, tenant.id) : null;
  const isAdmin = !!(
    session?.user.isSuperAdmin ||
    membership?.role === UserRole.ADMIN ||
    membership?.role === UserRole.OWNER
  );

  // posts is already filtered with postStatusId: { not: null }
  const showAdminHint = isAdmin && postStatuses.length === 0 && posts.length > 0;

  const [t, tc] = await Promise.all([getTranslations("roadmap"), getTranslations("common")]);

  return (
    <div className="flex-1 flex flex-col overflow-x-hidden mx-auto w-full max-w-7xl px-4 py-4">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      {showAdminHint && (
        <UIAlert
          variant="warning"
          className="mb-4"
          description={
            <>
              {t("adminNoStatusHint", { count: posts.length })}{" "}
              <a href={dirtyDomainFixer("/admin/statuses")}>{t("adminNoStatusLink")}</a>
            </>
          }
        />
      )}
      {postStatuses.length === 0 && !showAdminHint && (
        <UIAlert variant="default" className="mb-4" description={t("empty")} />
      )}
      <div className="flex flex-1 min-h-0 gap-2 w-full overflow-x-auto scrollbar-thin snap-x">
        {postStatuses.map(statusColumn => {
          const postsInColumn = posts.filter(post => post.postStatusId === statusColumn.id);
          return (
            <div
              key={statusColumn.id}
              className={cn("flex grow-0 shrink-0 flex-col overflow-hidden snap-start scroll-ml-2", {
                "w-[24%]": postStatuses.length >= 4,
                "w-[32%]": postStatuses.length <= 3,
              })}
            >
              <span className={cn(`fr-roadmap-column--color-${statusColumn.color}`, "font-bold p-2 inline-block")}>
                {statusColumn.name}
                <span className="ml-2 text-muted-foreground font-normal text-sm">
                  {tc("item", { count: postsInColumn.length })}
                </span>
              </span>

              <ClientAnimate className="flex-1 overflow-y-auto snap-y scrollbar-thin">
                {postsInColumn.length === 0 && <p className="p-4 text-muted-foreground">{t("emptyColumn")}</p>}
                {postsInColumn.map(post => (
                  <div key={post.id} className="flex items-start gap-2 my-2 mx-1 snap-start scroll-mt-2">
                    {showVotes && (
                      <LikeButton
                        postId={post.id}
                        tenantId={tenant.id}
                        size="sm"
                        userId={userId}
                        alreadyLiked={post.likes.some(
                          like => userId === like.userId || like.anonymousId === anonymousId,
                        )}
                      >
                        {post._count.likes}
                      </LikeButton>
                    )}
                    <UICard
                      title={post.title}
                      className="flex-1"
                      shadow
                      titleAs="h4"
                      href={dirtyDomainFixer(`/post/${post.id}`)}
                      size="sm"
                      horizontal
                      footer={
                        <UITag as="span" size="sm">
                          {post.board.name}
                        </UITag>
                      }
                    />
                  </div>
                ))}
              </ClientAnimate>
            </div>
          );
        })}
      </div>
    </div>
  );
});
export default RoadmapPage;
