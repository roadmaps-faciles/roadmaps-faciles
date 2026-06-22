import { type Metadata } from "next";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { getTenantFromDomain } from "@/utils/tenant";

/**
 * Truncate a text string for use as a meta description (max 160 chars).
 * Strips markdown syntax and normalizes whitespace.
 */
export const truncateDescription = (text: null | string | undefined, maxLength = 160): string => {
  if (!text) return "";
  const plain = text
    .replace(/[#*_`~[\]()>|\\-]/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength - 1).trim() + "…";
};

/**
 * Build an absolute URL for a tenant page.
 */
const buildTenantUrl = (tenantSubdomain: string, tenantCustomDomain: null | string, path = "/"): string => {
  if (tenantCustomDomain) {
    return `https://${tenantCustomDomain}${path}`;
  }
  const host = config.host.replace(/\/$/, "");
  const rootDomain = host.replace(/^https?:\/\//, "").replace(/:\d+$/, "");
  return `${host.replace(rootDomain, `${tenantSubdomain}.${rootDomain}`)}${path}`;
};

/**
 * Resolve tenant from domain param. Returns null if not found (for generateMetadata safety).
 */
const resolveTenant = async (domain: string) => {
  try {
    return await getTenantFromDomain(domain);
  } catch {
    return null;
  }
};

/**
 * Fetch tenant settings for metadata generation.
 */
const getTenantSettingsForMetadata = async (tenantId: number) => {
  return prisma.tenantSettings.findFirst({
    where: { tenantId },
    select: { name: true, subdomain: true, customDomain: true },
  });
};

/**
 * Generate metadata for a tenant layout (title template, description, OG).
 */
export const generateTenantMetadata = async (domain: string): Promise<Metadata> => {
  const tenant = await resolveTenant(domain);
  if (!tenant) return {};

  const settings = await getTenantSettingsForMetadata(tenant.id);
  if (!settings) return {};

  const url = buildTenantUrl(settings.subdomain, settings.customDomain);

  return {
    title: {
      template: `%s - ${settings.name}`,
      default: settings.name,
    },
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: settings.name,
      url,
      images: [
        {
          url: new URL("/img/roadmaps-faciles.png", config.host),
          alt: settings.name,
        },
      ],
    },
  };
};

/**
 * Generate metadata for a board page.
 */
export const generateBoardMetadata = async (domain: string, boardSlug: string): Promise<Metadata> => {
  const tenant = await resolveTenant(domain);
  if (!tenant) return {};

  const [settings, board] = await Promise.all([
    getTenantSettingsForMetadata(tenant.id),
    prisma.board.findUnique({
      where: { slug_tenantId: { slug: boardSlug, tenantId: tenant.id } },
      select: { name: true, description: true, slug: true },
    }),
  ]);

  if (!settings || !board) return {};

  const description = truncateDescription(board.description) || `${board.name} - ${settings.name}`;
  const url = buildTenantUrl(settings.subdomain, settings.customDomain, `/board/${board.slug}`);

  return {
    title: board.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${board.name} - ${settings.name}`,
      description,
      url,
    },
  };
};

/**
 * Generate metadata for a post detail page.
 */
export const generatePostMetadata = async (domain: string, postId: string): Promise<Metadata> => {
  const id = Number(postId);
  if (isNaN(id)) return {};

  const tenant = await resolveTenant(domain);
  if (!tenant) return {};

  const [settings, post] = await Promise.all([
    getTenantSettingsForMetadata(tenant.id),
    prisma.post.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        board: { select: { name: true } },
        user: { select: { name: true } },
        createdAt: true,
      },
    }),
  ]);

  if (!settings || !post) return {};

  const description = truncateDescription(post.description) || `${post.title} - ${settings.name}`;
  const url = buildTenantUrl(settings.subdomain, settings.customDomain, `/post/${id}`);

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.title} - ${settings.name}`,
      description,
      url,
      ...(post.createdAt && { publishedTime: post.createdAt.toISOString() }),
      ...(post.user?.name && { authors: [post.user.name] }),
    },
  };
};
