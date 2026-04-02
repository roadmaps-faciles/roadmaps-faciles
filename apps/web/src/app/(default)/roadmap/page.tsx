import { Badge, Button, cn } from "@roadmaps-faciles/ui";
import { ArrowRight, ThumbsUp } from "lucide-react";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { appSettingsRepo, tenantRepo } from "@/lib/repo";

import { sharedMetadata } from "../../shared-metadata";

const url = "/roadmap";

export const metadata: Metadata = {
  ...sharedMetadata,
  openGraph: {
    ...sharedMetadata.openGraph,
    url,
  },
  alternates: {
    canonical: url,
  },
};

const getTenantUrl = (subdomain: string, customDomain: null | string) => {
  if (customDomain) return `https://${customDomain}`;
  const hostUrl = new URL(config.host);
  return `${hostUrl.protocol}//${subdomain}.${hostUrl.host}`;
};

const RoadmapPageInner = async () => {
  await connection();

  const [t, tc] = await Promise.all([getTranslations("roadmap"), getTranslations("common")]);

  const notConfigured = (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-muted-foreground">{t("notConfigured")}</p>
    </div>
  );

  const appSettings = await appSettingsRepo.get();
  if (!appSettings.pinnedTenantId) return notConfigured;

  const tenant = await tenantRepo.findById(appSettings.pinnedTenantId);
  if (!tenant || tenant.deletedAt) return notConfigured;

  const tenantSettings = await prisma.tenantSettings.findFirst({
    where: { tenantId: tenant.id },
  });
  if (!tenantSettings || tenantSettings.isPrivate) return notConfigured;

  const tenantUrl = getTenantUrl(tenantSettings.subdomain, tenantSettings.customDomain);

  const [postStatuses, posts] = await Promise.all([
    prisma.postStatus.findMany({
      where: {
        tenantId: tenant.id,
        showInRoadmap: true,
      },
      orderBy: {
        order: "asc",
      },
    }),
    prisma.post.findMany({
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
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-1 flex-col overflow-x-hidden px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href={tenantUrl}>
            {t("submitFeedback")}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{t("description")}</p>

      {postStatuses.length === 0 ? (
        <p className="py-8 text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto">
          {postStatuses.map(statusColumn => {
            const postsInColumn = posts.filter(post => post.postStatusId === statusColumn.id);
            return (
              <div
                key={statusColumn.id}
                className={cn("flex shrink-0 grow-0 snap-start flex-col overflow-hidden scroll-ml-2", {
                  "w-[24%]": postStatuses.length >= 4,
                  "w-[32%]": postStatuses.length <= 3,
                })}
              >
                <div className={cn("rounded-t-md p-2 font-semibold", `fr-roadmap-column--color-${statusColumn.color}`)}>
                  {statusColumn.name}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {tc("item", { count: postsInColumn.length })}
                  </span>
                </div>

                <ClientAnimate className="flex-1 snap-y overflow-y-auto">
                  {postsInColumn.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">{t("emptyColumn")}</p>
                  )}
                  {postsInColumn.map(post => (
                    <Link
                      key={post.id}
                      href={`${tenantUrl}/post/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="my-1 block snap-start rounded-md border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start gap-2">
                        {post._count.likes > 0 && (
                          <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                            <ThumbsUp className="size-3" />
                            {post._count.likes}
                          </span>
                        )}
                        <h4 className="flex-1 text-sm font-medium">{post.title}</h4>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Badge variant="outline" className="text-xs">
                          {post.board.name}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </ClientAnimate>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RoadmapPage = () => (
  <Suspense>
    <RoadmapPageInner />
  </Suspense>
);

export default RoadmapPage;
