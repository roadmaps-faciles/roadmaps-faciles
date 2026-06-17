"use client";

import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@roadmaps-faciles/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@roadmaps-faciles/ui/components/dialog";
import { useTranslations } from "next-intl";
import { lazy, Suspense, useEffect, useState } from "react";

// Lazy: only pull the status board (and its polling) into the bundle when the dialog opens.
const StatusBoard = lazy(() => import("@/app/(default)/status/StatusBoard").then(m => ({ default: m.StatusBoard })));

type StatusLevel = "degraded" | "down" | "operational";

const DOT_CLASS: Record<StatusLevel, string> = {
  operational: "bg-green-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

const POLL_INTERVAL_MS = 30_000;

export const SystemStatusWidget = ({ version }: { version: string }) => {
  const t = useTranslations("systemStatus");
  const [level, setLevel] = useState<null | StatusLevel>(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        const data = (await res.json()) as { status: StatusLevel };
        if (active) setLevel(data.status);
      } catch {
        if (active) setLevel("down");
      }
    };
    void poll();
    const id = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const dot = DOT_CLASS[level ?? "operational"];
  const label = level === null ? t("checking") : t(level);
  const pulse = level === null || level === "operational" ? "animate-pulse" : "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label={label} className="w-full text-left">
          {/* Expanded */}
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2.5 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden">
            <div className="mb-0.5 flex items-center gap-2">
              <div className={cn("size-2 rounded-full", dot, pulse)} />
              <span className="text-[10px] font-bold uppercase tracking-wide text-sidebar-foreground/70">{label}</span>
            </div>
            <p className="text-[10px] text-sidebar-foreground/50">{version}</p>
          </div>
          {/* Collapsed: dot only, with tooltip */}
          <div className="hidden group-data-[collapsible=icon]:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center py-1">
                    <div className={cn("size-2 rounded-full", dot, pulse)} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">
                    {label} - {version}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("pageTitle")}</DialogTitle>
          <DialogDescription>{t("pageSubtitle")}</DialogDescription>
        </DialogHeader>
        <Suspense fallback={null}>
          <StatusBoard embedded />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};
