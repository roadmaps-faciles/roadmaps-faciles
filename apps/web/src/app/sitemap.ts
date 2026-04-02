import { type MetadataRoute } from "next";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  if (config.env !== "prod") {
    return [];
  }

  const host = config.host.replace(/\/$/, "");

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: host, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${host}/roadmap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${host}/doc`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${host}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${host}/politique-de-confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${host}/cgu`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${host}/accessibilite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Public tenants with their boards and approved posts
  const tenants = await prisma.tenantSettings.findMany({
    where: { isPrivate: false },
    select: {
      name: true,
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

  const rootDomain = host.replace(/^https?:\/\//, "").replace(/:\d+$/, "");
  const protocol = host.startsWith("https") ? "https" : "http";
  const port = host.match(/:(\d+)$/)?.[1];

  const tenantPages: MetadataRoute.Sitemap = [];

  for (const settings of tenants) {
    const tenantHost = settings.customDomain
      ? `${protocol}://${settings.customDomain}`
      : `${protocol}://${settings.subdomain}.${rootDomain}${port ? `:${port}` : ""}`;

    // Tenant root
    tenantPages.push({
      url: tenantHost,
      lastModified: settings.tenant.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });

    // Tenant roadmap
    tenantPages.push({
      url: `${tenantHost}/roadmap`,
      changeFrequency: "weekly",
      priority: 0.6,
    });

    // Boards and posts
    for (const board of settings.tenant.boards) {
      if (!board.slug) continue;

      tenantPages.push({
        url: `${tenantHost}/board/${board.slug}`,
        lastModified: board.updatedAt,
        changeFrequency: "daily",
        priority: 0.6,
      });

      for (const post of board.posts) {
        tenantPages.push({
          url: `${tenantHost}/post/${post.id}`,
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
