"use client";

import { cn } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const ModerationSideMenu = () => {
  const pathname = usePathname();
  const t = useTranslations("moderation.sideMenu");

  const currentPage = pathname.split("/moderation")[1]?.replace(/^\//, "") || "";

  const items = [
    { label: t("pendingPosts"), href: "/moderation", active: currentPage === "" },
    { label: t("rejectedPosts"), href: "/moderation/rejected", active: currentPage === "rejected" },
  ];

  return (
    <nav className="sticky top-4">
      <ul className="flex flex-col gap-1">
        {items.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
