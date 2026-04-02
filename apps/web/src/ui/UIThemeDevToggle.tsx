"use client";

import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@roadmaps-faciles/ui";
import { Palette } from "lucide-react";
import { useCallback } from "react";

import { type UiTheme } from "./types";
import { useUI } from "./UIContext";

const COOKIE_NAME = "ui-theme-dev";

const toggle = (current: UiTheme): UiTheme => (current === "Default" ? "Dsfr" : "Default");

/**
 * Dev-only button that cycles the UI theme (Default ↔ Dsfr) via a cookie override.
 * Tree-shaken in production builds (`process.env.NODE_ENV` is replaced at compile time).
 */
export const UIThemeDevToggle = () => {
  if (process.env.NODE_ENV !== "development") return null;

  return <UIThemeDevToggleInner />;
};

const UIThemeDevToggleInner = () => {
  const theme = useUI();

  const handleClick = useCallback(() => {
    const next = toggle(theme);
    document.cookie = `${COOKIE_NAME}=${next};path=/;max-age=86400`;
    location.reload();
  }, [theme]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleClick}>
            <Palette className="size-4" />
            <span className="sr-only">Toggle UI Theme (dev)</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>UI: {theme}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
