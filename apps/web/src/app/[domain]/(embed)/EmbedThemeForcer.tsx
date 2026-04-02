"use client";

import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useUI } from "@/ui";

export const EmbedThemeForcer = () => {
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const uiTheme = useUI();

  // DSFR dark mode
  const { setIsDark } = useIsDark();

  useEffect(() => {
    if (themeParam === "dark") {
      // DSFR
      setIsDark(true);
      // Default (shadcn) — add .dark class on <html>
      if (uiTheme === "Default") {
        document.documentElement.classList.add("dark");
      }
    } else if (themeParam === "light") {
      setIsDark(false);
      if (uiTheme === "Default") {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [themeParam, setIsDark, uiTheme]);

  return null;
};
