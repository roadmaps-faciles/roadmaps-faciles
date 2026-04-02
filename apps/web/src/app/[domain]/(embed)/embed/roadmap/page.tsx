import { cn } from "@roadmaps-faciles/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import z from "zod";

import { LikeButton } from "@/components/Board/LikeButton";
import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { UIAlert, UICard, UITag } from "@/ui/bridge";
import { getAnonymousId } from "@/utils/anonymousId/getAnonymousId";
import { getDirtyDomain } from "@/utils/dirtyDomain/getDirtyDomain";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";
import { getTenantFromDomain } from "@/utils/tenant";

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
  const tenantSettings = await prisma.tenantSettings.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!tenantSettings) {
    return null;
  }

  const [t, tr, tc, session, anonymousId, dirtyDomain] = await Promise.all([
    getTranslations("embed"),
    getTranslations("roadmap"),
    getTranslations("common"),
    auth(),
    getAnonymousId(),
    getDirtyDomain(),
  ]);

  // Handle private tenants
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

  return (
    <div className="flex-1 flex flex-col overflow-x-hidden mx-auto w-full max-w-7xl px-4 py-4">
      <h2 className="text-2xl font-bold mb-4">{tr("title")}</h2>
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
                {postsInColumn.length === 0 && <p className="p-4 text-muted-foreground">{tr("emptyColumn")}</p>}
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
                      linkTarget="_blank"
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
};

const EmbedRoadmapPage = (props: EmbedRoadmapPageProps) => (
  <Suspense>
    <EmbedRoadmapPageInner {...props} />
  </Suspense>
);

export default EmbedRoadmapPage;
