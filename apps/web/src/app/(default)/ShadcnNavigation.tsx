"use client";

import { cn } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const ShadcnNavigation = ({ isSelfHost = false }: { isSelfHost?: boolean }) => {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const items = [
    { text: t("home"), href: "/", isActive: pathname === "/" },
    {
      text: t("workspaces"),
      href: "/workspaces",
      isActive: pathname.startsWith("/workspaces") || pathname.startsWith("/tenant"),
    },
    { text: t("roadmap"), href: "/roadmap", isActive: pathname.startsWith("/roadmap") },
    ...(isSelfHost ? [] : [{ text: t("pricing"), href: "/pricing", isActive: pathname.startsWith("/pricing") }]),
    { text: t("doc"), href: "/doc", isActive: pathname.startsWith("/doc") },
  ];

  return (
    <>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-primary",
            item.isActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {item.text}
        </Link>
      ))}
    </>
  );
};
