"use client";

import { cn } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";

import { type Board, type TenantSettings } from "@/prisma/client";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";

interface ShadcnDomainNavigationProps {
  boards: Board[];
  tenantSettings: TenantSettings;
}

export const ShadcnDomainNavigation = ({ boards, tenantSettings }: ShadcnDomainNavigationProps) => {
  const segments = useSelectedLayoutSegments();
  const segment = segments.join("/");
  const pathname = usePathname();
  const dirtyDomainFixer = dirtySafePathname(pathname);
  const t = useTranslations("navigation");

  const items = [
    ...(tenantSettings.showRoadmapInHeader
      ? [{ text: t("roadmap"), href: dirtyDomainFixer("/roadmap"), isActive: segment === "roadmap" }]
      : []),
    ...boards.map(board => ({
      text: board.name,
      href: dirtyDomainFixer(`/board/${board.slug}`),
      isActive: segment === `board/${board.slug}` || (!segment && board.id === tenantSettings.rootBoardId),
    })),
  ];

  return (
    <>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground/80",
            item.isActive ? "text-foreground" : "text-foreground/60",
          )}
        >
          {item.text}
        </Link>
      ))}
    </>
  );
};
