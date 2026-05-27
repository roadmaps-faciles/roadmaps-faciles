import { type MetadataRoute } from "next";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getTenantCanonicalOrigin } from "@/utils/tenantUrl";

import { type DomainParams } from "./(default)/layout";

const robots = async ({ params }: { params: Promise<DomainParams> }): Promise<MetadataRoute.Robots> => {
  await connection();

  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);

  const settings = await prisma.tenantSettings.findFirst({
    where: { OR: [{ subdomain: decodedDomain }, { customDomain: decodedDomain }] },
    select: { allowIndexing: true, isPrivate: true, subdomain: true, customDomain: true },
  });

  if (!settings || settings.isPrivate || !settings.allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const origin = getTenantCanonicalOrigin(settings.subdomain, settings.customDomain);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/2fa", "/moderation/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
};

export default robots;
