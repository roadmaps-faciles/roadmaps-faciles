"use client";

import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@roadmaps-faciles/ui";
import { Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useSyncExternalStore } from "react";

type Theme = "dark" | "light" | "system";

const CYCLE: Theme[] = ["light", "dark", "system"];

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return "system";
};

const applyTheme = (theme: Theme) => {
  const isDark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme:dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const iconMap = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

// Storage event listener for useSyncExternalStore - filter on "theme" key only
const subscribe = (cb: () => void) => {
  const handler = (e: StorageEvent) => {
    if (e.key === "theme" || e.key === null) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

export interface ThemeToggleProps {
  /** Hide the tooltip (useful in mobile sheets where tooltips are distracting) */
  compact?: boolean;
}

export const ThemeToggle = ({ compact }: ThemeToggleProps = {}) => {
  const t = useTranslations("themeToggle");
  const theme = useSyncExternalStore<Theme>(subscribe, getStoredTheme, () => "system");

  useEffect(() => {
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme:dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const handleClick = useCallback(() => {
    const nextIndex = (CYCLE.indexOf(theme) + 1) % CYCLE.length;
    const next = CYCLE[nextIndex];
    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
    applyTheme(next);
    // Dispatch storage event to trigger useSyncExternalStore re-render (same-tab)
    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
  }, [theme]);

  const Icon = iconMap[theme];

  const button = (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <Icon className="size-4" />
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{t("label")}</span>
    </Button>
  );

  if (compact) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{t(theme)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
