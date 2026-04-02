"use client";

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Progress,
  Switch,
} from "@roadmaps-faciles/ui";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { type SyncProgress } from "@/lib/ee/integration-provider/sync-types";
import { type SyncRunSummary } from "@/lib/repo/IIntegrationSyncLogRepo";
import { type IntegrationMapping, type TenantIntegration } from "@/prisma/client";

import { deleteIntegration, updateIntegration } from "../actions";
import { SyncRunTable } from "./SyncRunTable";

const formatDuration = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}min ${String(sec).padStart(2, "0")}s` : `${sec}s`;
};

interface IntegrationDetailProps {
  integration: TenantIntegration;
  mappings: IntegrationMapping[];
  syncRuns: SyncRunSummary[];
}

export const IntegrationDetail = ({ integration, mappings, syncRuns }: IntegrationDetailProps) => {
  const t = useTranslations("domainAdmin.integrations.detail");
  const tc = useTranslations("common");
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ conflicts: number; errors: number; synced: number } | null>(null);
  const [syncError, setSyncError] = useState<null | string>(null);
  const [syncProgress, setSyncProgress] = useState<null | SyncProgress>(null);
  const [cleanupPosts, setCleanupPosts] = useState(false);
  const [syncStartedAt, setSyncStartedAt] = useState<null | number>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [remoteSyncing, setRemoteSyncing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const processStartedAtRef = useRef<null | number>(null);
  const lastPhaseRef = useRef<null | string>(null);
  const remoteSyncingRef = useRef(false);

  const inboundPostCount = mappings.filter(
    m => m.localType === "post" && m.metadata && (m.metadata as Record<string, unknown>).direction === "inbound",
  ).length;
  const conflictCount = mappings.filter(m => m.syncStatus === "CONFLICT").length;
  const errorCount = mappings.filter(m => m.syncStatus === "ERROR").length;

  // Check if a sync is already running server-side
  useEffect(() => {
    if (syncing) return;

    let cancelled = false;
    const checkSyncStatus = async () => {
      try {
        const res = await fetch(`/api/ee/integrations/${integration.id}/sync`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { startedAt: null | number; syncing: boolean };
        if (cancelled) return;
        if (data.syncing) {
          if (!remoteSyncingRef.current) {
            remoteSyncingRef.current = true;
            setRemoteSyncing(true);
          }
          if (data.startedAt) setSyncStartedAt(data.startedAt);
        } else if (remoteSyncingRef.current) {
          remoteSyncingRef.current = false;
          setRemoteSyncing(false);
          setSyncStartedAt(null);
          router.refresh();
        }
      } catch {
        // Network error — ignore
      }
    };

    void checkSyncStatus();
    const interval = setInterval(() => void checkSyncStatus(), 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [integration.id, syncing, router]);

  // Elapsed timer
  useEffect(() => {
    if (!syncStartedAt) {
      setElapsedMs(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - syncStartedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [syncStartedAt]);

  const handleToggleEnabled = useCallback(async () => {
    await updateIntegration({ id: integration.id, enabled: !integration.enabled });
    router.refresh();
  }, [integration.id, integration.enabled, router]);

  const handleCancelMonitoring = useCallback(() => {
    abortControllerRef.current?.abort();
    setSyncing(false);
    setSyncProgress(null);
    setSyncStartedAt(null);
    processStartedAtRef.current = null;
    lastPhaseRef.current = null;
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    setSyncProgress(null);
    setSyncStartedAt(Date.now());
    processStartedAtRef.current = null;
    lastPhaseRef.current = null;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/ee/integrations/${integration.id}/sync`, {
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({ error: response.statusText }))) as { error?: string };
        setSyncError(body.error || response.statusText);
        setSyncing(false);
        setSyncStartedAt(null);
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.trim()) continue;
          const lines = event.split("\n");
          let eventType = "";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7);
            if (line.startsWith("data: ")) eventData = line.slice(6);
          }

          if (eventType === "progress") {
            const progress = JSON.parse(eventData) as SyncProgress;
            setSyncProgress(progress);

            const phaseKey = `${progress.phase}:${progress.total}`;
            if (lastPhaseRef.current !== phaseKey) {
              lastPhaseRef.current = phaseKey;
              processStartedAtRef.current = progress.total !== null && progress.current > 0 ? Date.now() : null;
            }
            if (progress.total !== null && progress.current > 0 && !processStartedAtRef.current) {
              processStartedAtRef.current = Date.now();
            }
          } else if (eventType === "done") {
            setSyncResult(JSON.parse(eventData) as { conflicts: number; errors: number; synced: number });
            setSyncing(false);
            setSyncProgress(null);
            setSyncStartedAt(null);
            processStartedAtRef.current = null;
            router.refresh();
          } else if (eventType === "error") {
            setSyncError((JSON.parse(eventData) as { message: string }).message);
            setSyncing(false);
            setSyncProgress(null);
            setSyncStartedAt(null);
            processStartedAtRef.current = null;
          }
        }
      }

      setSyncing(false);
      setSyncStartedAt(null);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setSyncError((error as Error).message);
      setSyncing(false);
      setSyncProgress(null);
      setSyncStartedAt(null);
      processStartedAtRef.current = null;
    }
  }, [integration.id, router]);

  const handleDelete = useCallback(async () => {
    const result = await deleteIntegration({ id: integration.id, cleanupInboundPosts: cleanupPosts });
    if (result.ok) {
      router.push("/admin/integrations");
    }
  }, [integration.id, cleanupPosts, router]);

  const progressPercent =
    syncProgress?.total != null && syncProgress.total > 0
      ? Math.round((syncProgress.current / syncProgress.total) * 100)
      : null;

  return (
    <div>
      {/* Status badges */}
      <div className="mb-6 flex gap-2">
        <Badge variant={integration.enabled ? "default" : "secondary"}>
          {integration.enabled ? t("enabled") : t("disabled")}
        </Badge>
        <Badge variant="outline">{integration.type}</Badge>
        {conflictCount > 0 && <Badge variant="secondary">{t("conflicts", { count: conflictCount })}</Badge>}
        {errorCount > 0 && <Badge variant="destructive">{t("errors", { count: errorCount })}</Badge>}
      </div>

      {/* Info */}
      <div className="mb-6 space-y-1 text-sm">
        <p>
          {integration.lastSyncAt
            ? t("lastSyncAt", { date: new Date(integration.lastSyncAt).toLocaleString() })
            : t("neverSynced")}
        </p>
        <p>{t("mappedPosts", { count: mappings.filter(m => m.localType === "post").length })}</p>
        {integration.syncIntervalMinutes && <p>{t("autoSync", { minutes: integration.syncIntervalMinutes })}</p>}
      </div>

      {/* Actions */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="toggle-enabled"
            checked={integration.enabled}
            onCheckedChange={() => void handleToggleEnabled()}
          />
          <Label htmlFor="toggle-enabled">{t("enabledToggle")}</Label>
        </div>

        <Button onClick={() => void handleSync()} disabled={syncing || remoteSyncing || !integration.enabled}>
          {syncing || remoteSyncing ? t("syncing") : t("syncNow")}
        </Button>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-1 size-4" />
              {t("delete")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteTitle")}</DialogTitle>
            </DialogHeader>
            <p>{t("deleteWarning")}</p>
            {inboundPostCount > 0 && (
              <div className="flex items-center gap-2">
                <Switch id="cleanup-posts" checked={cleanupPosts} onCheckedChange={setCleanupPosts} />
                <Label htmlFor="cleanup-posts">{t("cleanupInboundPosts", { count: inboundPostCount })}</Label>
              </div>
            )}
            <div className="mt-4 flex gap-4">
              <Button variant="destructive" onClick={() => void handleDelete()}>
                {t("confirmDelete")}
              </Button>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {tc("cancel")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Remote sync detected */}
      {remoteSyncing && !syncing && (
        <div className="mb-6">
          <Alert>
            <AlertDescription>{t("syncRemoteInProgress")}</AlertDescription>
          </Alert>
          <Progress className="mt-2" />
          <div className="mt-1 text-xs text-muted-foreground">
            <span>{t("syncElapsed", { time: formatDuration(elapsedMs) })}</span>
          </div>
        </div>
      )}

      {/* Sync feedback */}
      {syncing && syncProgress && syncProgress.total === null && syncProgress.current === 0 && (
        <div className="mb-6">
          <Alert>
            <AlertDescription>
              {syncProgress.phase === "outbound" ? t("syncFetchingOutbound") : t("syncFetchingInbound")}
            </AlertDescription>
          </Alert>
          <Progress className="mt-2" />
        </div>
      )}
      {syncing && syncProgress && syncProgress.total === null && syncProgress.current > 0 && (
        <div className="mb-6">
          <Alert>
            <AlertDescription>{t("syncStreamingProgress", { count: syncProgress.current })}</AlertDescription>
          </Alert>
          <Progress className="mt-2" />
        </div>
      )}
      {syncing && syncProgress && syncProgress.total !== null && syncProgress.total > 0 && (
        <div className="mb-6">
          <Alert>
            <AlertDescription>
              {syncProgress.phase === "outbound"
                ? t("syncProgressOutbound", { current: syncProgress.current, total: syncProgress.total })
                : t("syncProgressInbound", { current: syncProgress.current, total: syncProgress.total })}
            </AlertDescription>
          </Alert>
          <Progress value={progressPercent ?? undefined} className="mt-2" />
          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span>{t("syncElapsed", { time: formatDuration(elapsedMs) })}</span>
            {(() => {
              if (!processStartedAtRef.current || syncProgress.current < 3) return null;
              const processElapsed = Date.now() - processStartedAtRef.current;
              if (processElapsed < 3000) return null;
              const remaining = (processElapsed * syncProgress.total) / syncProgress.current - processElapsed;
              return <span>{t("syncEta", { time: formatDuration(remaining) })}</span>;
            })()}
          </div>
        </div>
      )}
      {syncing && !syncProgress && (
        <Alert className="mb-6">
          <AlertDescription>{t("syncInProgress")}</AlertDescription>
        </Alert>
      )}
      {/* Leave message + cancel button */}
      {(syncing || remoteSyncing) && (
        <div className="mb-6 flex items-center gap-4">
          <Alert className="flex-1">
            <AlertDescription>{t("syncCanLeave")}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleCancelMonitoring();
              remoteSyncingRef.current = false;
              setRemoteSyncing(false);
            }}
          >
            {t("syncCancelMonitoring")}
          </Button>
        </div>
      )}
      {syncResult && (
        <Alert variant={syncResult.errors > 0 ? "destructive" : "default"} className="mb-6">
          <AlertDescription>
            {t("syncResultMessage", {
              synced: syncResult.synced,
              errors: syncResult.errors,
              conflicts: syncResult.conflicts,
            })}
          </AlertDescription>
        </Alert>
      )}
      {syncError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{syncError}</AlertDescription>
        </Alert>
      )}

      {/* Sync logs */}
      <h2 className="mb-4 mt-8 text-xl font-semibold">{t("syncHistory")}</h2>
      <SyncRunTable runs={syncRuns} />
    </div>
  );
};
