"use client";

import { Badge, Button, cn } from "@roadmaps-faciles/ui";
import { RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type StatusLevel = "degraded" | "down" | "operational";

interface ServiceCheck {
  key: string;
  latencyMs: number;
  status: "healthy" | "unhealthy";
}

interface StatusData {
  services: ServiceCheck[];
  status: StatusLevel;
  timestamp: string;
  uptimeSeconds: number;
  version: string;
}

const BANNER_CLASS: Record<StatusLevel, string> = {
  operational: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  degraded: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  down: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

const DOT_CLASS: Record<StatusLevel, string> = {
  operational: "bg-green-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

const SERVICE_LABEL_KEY = {
  database: "serviceDatabase",
  redis: "serviceRedis",
  storage: "serviceStorage",
} as const;

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [d ? `${d}j` : "", h ? `${h}h` : "", `${m}m`].filter(Boolean).join(" ");
};

export const StatusBoard = ({ embedded = false }: { embedded?: boolean }) => {
  const t = useTranslations("systemStatus");
  const locale = useLocale();
  const [data, setData] = useState<null | StatusData>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      setData((await res.json()) as StatusData);
    } catch {
      setData(prev => (prev ? { ...prev, status: "down" } : null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        const json = (await res.json()) as StatusData;
        if (active) setData(json);
      } catch {
        if (active) setData(prev => (prev ? { ...prev, status: "down" } : null));
      }
    };
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const level = data?.status ?? null;

  return (
    <div className={cn(embedded ? "space-y-6" : "mx-auto max-w-2xl px-4 py-16")}>
      <div className="mb-6 flex items-center justify-between gap-4">
        {!embedded && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("pageTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("pageSubtitle")}</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          {t("refresh")}
        </Button>
      </div>

      <div
        className={cn(
          "mb-6 flex items-center gap-3 rounded-lg border p-4",
          level ? BANNER_CLASS[level] : "border-muted bg-muted/30 text-muted-foreground",
        )}
      >
        <div className={cn("size-3 animate-pulse rounded-full", level ? DOT_CLASS[level] : "bg-muted-foreground/40")} />
        <span className="font-semibold">{level ? t(level) : t("checking")}</span>
      </div>

      <div className="divide-y rounded-lg border">
        {(data?.services ?? []).map(service => {
          const labelKey = SERVICE_LABEL_KEY[service.key as keyof typeof SERVICE_LABEL_KEY];
          return (
            <div key={service.key} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{labelKey ? t(labelKey) : service.key}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{service.latencyMs} ms</span>
                <Badge variant={service.status === "healthy" ? "outline" : "destructive"}>
                  {service.status === "healthy" ? t("healthy") : t("unhealthy")}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {data && (
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">{t("uptime")}</dt>
            <dd className="font-medium">{formatUptime(data.uptimeSeconds)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("version")}</dt>
            <dd className="font-medium">v{data.version}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("lastChecked")}</dt>
            <dd className="font-medium">{new Date(data.timestamp).toLocaleTimeString(locale)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
};
