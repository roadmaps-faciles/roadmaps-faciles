"use client";

import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@roadmaps-faciles/ui";
import { Eraser, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { type CapturedEvent } from "@/lib/ee/tracking-provider/memory/server";
import { formatDateHour } from "@/utils/date";

import { clearTrackingDebugEvents } from "./actions";

const REFRESH_INTERVAL_MS = 2000;

const SOURCE_VARIANTS: Record<CapturedEvent["source"], "default" | "outline" | "secondary"> = {
  client: "secondary",
  server: "default",
};

const TYPE_VARIANTS: Record<CapturedEvent["type"], "default" | "outline" | "secondary"> = {
  group: "outline",
  identify: "outline",
  page: "secondary",
  track: "default",
};

interface AnalyticsDebugViewProps {
  initialEvents: readonly CapturedEvent[];
}

export const AnalyticsDebugView = ({ initialEvents }: AnalyticsDebugViewProps) => {
  const t = useTranslations("rootAdmin.analyticsDebug");
  const locale = useLocale();
  const [events, setEvents] = useState<readonly CapturedEvent[]>(initialEvents);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [eventFilter, setEventFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | CapturedEvent["source"]>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isClearing, startClear] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/dev/tracking-debug", { cache: "no-store" });
      if (response.ok) {
        const json = (await response.json()) as { events: CapturedEvent[] };
        setEvents(json.events);
      }
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [autoRefresh, refresh]);

  const handleClear = () => {
    startClear(async () => {
      await clearTrackingDebugEvents();
      setEvents([]);
      setExpanded(new Set());
    });
  };

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    const needle = eventFilter.trim().toLowerCase();
    return events.filter(event => {
      if (sourceFilter !== "all" && event.source !== sourceFilter) return false;
      if (needle && !event.event.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [events, eventFilter, sourceFilter]);

  const stats = useMemo(() => {
    const byType: Record<CapturedEvent["type"], number> = { group: 0, identify: 0, page: 0, track: 0 };
    for (const e of events) byType[e.type]++;
    return { byType, total: events.length };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-50">
          <Label htmlFor="event-filter">{t("filterEvent")}</Label>
          <Input
            id="event-filter"
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            placeholder={t("filterEventPlaceholder")}
          />
        </div>
        <div className="min-w-40">
          <Label htmlFor="source-filter">{t("filterSource")}</Label>
          <Select value={sourceFilter} onValueChange={value => setSourceFilter(value as typeof sourceFilter)}>
            <SelectTrigger id="source-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sourceAll")}</SelectItem>
              <SelectItem value="server">{t("sourceServer")}</SelectItem>
              <SelectItem value="client">{t("sourceClient")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          <Label htmlFor="auto-refresh" className="cursor-pointer">
            {t("autoRefresh")}
          </Label>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={refreshing}>
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          {t("refresh")}
        </Button>
        <Button variant="destructive" onClick={handleClear} disabled={isClearing || events.length === 0}>
          <Eraser className="size-4" />
          {t("clear")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">
          {t("statTotal")}: {stats.total}
        </Badge>
        <Badge variant="outline">
          {t("statTrack")}: {stats.byType.track}
        </Badge>
        <Badge variant="outline">
          {t("statPage")}: {stats.byType.page}
        </Badge>
        <Badge variant="outline">
          {t("statIdentify")}: {stats.byType.identify}
        </Badge>
        <Badge variant="outline">
          {t("statGroup")}: {stats.byType.group}
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">{t("colTime")}</TableHead>
              <TableHead className="w-25">{t("colSource")}</TableHead>
              <TableHead className="w-25">{t("colType")}</TableHead>
              <TableHead>{t("colEvent")}</TableHead>
              <TableHead>{t("colDistinctId")}</TableHead>
              <TableHead>{t("colProperties")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {events.length === 0 ? t("empty") : t("emptyFiltered")}
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map(event => {
                const isExpanded = expanded.has(event.id);
                const hasProperties = Object.keys(event.properties).length > 0;
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {formatDateHour(new Date(event.capturedAt), locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={SOURCE_VARIANTS[event.source]}>{event.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={TYPE_VARIANTS[event.type]}>{event.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{event.event}</TableCell>
                    <TableCell className="font-mono text-xs">{event.distinctId}</TableCell>
                    <TableCell>
                      {hasProperties ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(event.id)}
                          className="text-left text-xs text-blue-600 hover:underline"
                        >
                          {isExpanded
                            ? t("hideProperties")
                            : t("showProperties", { count: Object.keys(event.properties).length })}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("noProperties")}</span>
                      )}
                      {isExpanded && hasProperties && (
                        <pre className="mt-2 max-w-md overflow-auto rounded-sm bg-muted p-2 text-xs">
                          {JSON.stringify(event.properties, null, 2)}
                        </pre>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
