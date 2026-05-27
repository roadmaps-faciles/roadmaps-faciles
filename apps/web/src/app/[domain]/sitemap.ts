import { type MetadataRoute } from "next";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { getTenantCanonicalOrigin } from "@/utils/tenantUrl";

import { type DomainParams } from "./(default)/layout";

const sitemap = async ({ params }: { params: Promise<DomainParams> }): Promise<MetadataRoute.Sitemap> => {
  await connection();

  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);

  const settings = await prisma.tenantSettings.findFirst({
    where: { OR: [{ subdomain: decodedDomain }, { customDomain: decodedDomain }] },
    select: {
      allowIndexing: true,
      isPrivate: true,
      subdomain: true,
      customDomain: true,
      tenant: {
        select: {
          updatedAt: true,
          boards: {
            select: {
              slug: true,
              updatedAt: true,
              posts: {
                where: { approvalStatus: POST_APPROVAL_STATUS.APPROVED },
                select: { id: true, updatedAt: true },
                orderBy: { updatedAt: "desc" },
                take: 100,
              },
            },
          },
        },
      },
    },
  });

  if (!settings || settings.isPrivate || !settings.allowIndexing) {
    return [];
  }

  const origin = getTenantCanonicalOrigin(settings.subdomain, settings.customDomain);

  const pages: MetadataRoute.Sitemap = [
    { url: origin, lastModified: settings.tenant.updatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/roadmap`, changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const board of settings.tenant.boards) {
    if (!board.slug) continue;

    pages.push({
      url: `${origin}/board/${board.slug}`,
      lastModified: board.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    });

    for (const post of board.posts) {
      pages.push({
        url: `${origin}/post/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return pages;
};

export default sitemap;
