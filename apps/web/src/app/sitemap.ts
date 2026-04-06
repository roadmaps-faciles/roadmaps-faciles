import { type MetadataRoute } from "next";
import { connection } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { getTenantCanonicalOrigin } from "@/utils/tenantUrl";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  await connection();

  if (config.env !== "prod") {
    return [];
  }

  const host = config.host.replace(/\/$/, "");

  const staticPages: MetadataRoute.Sitemap = [
    { url: host, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${host}/roadmap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${host}/doc`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${host}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${host}/politique-de-confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${host}/cgu`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${host}/accessibilite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const tenants = await prisma.tenantSettings.findMany({
    where: { isPrivate: false, allowIndexing: true },
    select: {
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

  const tenantPages: MetadataRoute.Sitemap = [];

  for (const settings of tenants) {
    const origin = getTenantCanonicalOrigin(settings.subdomain, settings.customDomain);

    tenantPages.push({
      url: origin,
      lastModified: settings.tenant.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    tenantPages.push({ url: `${origin}/roadmap`, changeFrequency: "weekly", priority: 0.6 });

    for (const board of settings.tenant.boards) {
      if (!board.slug) continue;

      tenantPages.push({
        url: `${origin}/board/${board.slug}`,
        lastModified: board.updatedAt,
        changeFrequency: "daily",
        priority: 0.6,
      });

      for (const post of board.posts) {
        tenantPages.push({
          url: `${origin}/post/${post.id}`,
          lastModified: post.updatedAt,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  }

  return [...staticPages, ...tenantPages];
};

export default sitemap;
