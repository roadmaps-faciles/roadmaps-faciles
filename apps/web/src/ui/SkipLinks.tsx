"use client";

import { useTranslations } from "next-intl";

export const SkipLinks = () => {
  const t = useTranslations("skipLinks");

  return (
    <nav
      aria-label={t("nav")}
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-[9999] focus-within:flex focus-within:gap-2 focus-within:bg-background focus-within:p-2 focus-within:shadow-md"
    >
      <a
        href="#content"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("content")}
      </a>
      <a
        href="#footer"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("footer")}
      </a>
    </nav>
  );
};
