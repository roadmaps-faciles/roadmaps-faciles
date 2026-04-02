"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@roadmaps-faciles/ui/components/card";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Separator } from "@roadmaps-faciles/ui/components/separator";
import { Switch } from "@roadmaps-faciles/ui/components/switch";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { type POST_STATUS_COLOR } from "@/lib/model/PostStatus";
import { type PostStatus } from "@/prisma/client";

import { createPostStatus, deletePostStatus, reorderPostStatuses, updatePostStatus } from "./actions";
import { ColorSelect } from "./ColorSelect";
import { StatusBadge } from "./StatusBadge";

interface StatusesListProps {
  statuses: PostStatus[];
}

export const StatusesList = ({ statuses: initialStatuses }: StatusesListProps) => {
  const t = useTranslations("domainAdmin.statuses");
  const tc = useTranslations("common");
  const [statuses, setStatuses] = useState(initialStatuses);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<keyof typeof POST_STATUS_COLOR>("blueCumulus");
  const [newShowInRoadmap, setNewShowInRoadmap] = useState(true);
  const [editingId, setEditingId] = useState<null | number>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<keyof typeof POST_STATUS_COLOR>("blueCumulus");
  const [editShowInRoadmap, setEditShowInRoadmap] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const handleCreate = async () => {
    const result = await createPostStatus({ name: newName, color: newColor, showInRoadmap: newShowInRoadmap });
    if (result.ok && result.data) {
      setStatuses([...statuses, result.data]);
      setNewName("");
      setNewColor("blueCumulus");
      setNewShowInRoadmap(true);
    }
  };

  const handleUpdate = async (id: number) => {
    const result = await updatePostStatus({ id, name: editName, color: editColor, showInRoadmap: editShowInRoadmap });
    if (result.ok && result.data) {
      setStatuses(statuses.map(s => (s.id === id ? result.data : s)));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tc("areYouSure"))) return;
    const result = await deletePostStatus({ id });
    if (result.ok) {
      setStatuses(statuses.filter(s => s.id !== id));
      setError(null);
    } else if (!result.ok) {
      setError(result.error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newStatuses = [...statuses];
    [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
    const items = newStatuses.map((s, i) => ({ id: s.id, order: i }));
    await reorderPostStatuses({ items });
    setStatuses(newStatuses);
  };

  const handleMoveDown = async (index: number) => {
    if (index === statuses.length - 1) return;
    const newStatuses = [...statuses];
    [newStatuses[index], newStatuses[index + 1]] = [newStatuses[index + 1], newStatuses[index]];
    const items = newStatuses.map((s, i) => ({ id: s.id, order: i }));
    await reorderPostStatuses({ items });
    setStatuses(newStatuses);
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{tc("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("title")}
              </CardTitle>
              <p className="text-xs text-muted-foreground/60">
                {statuses.length} {statuses.length === 1 ? "statut" : "statuts"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {statuses.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{t("noStatuses")}</p>
          ) : (
            <div className="divide-y">
              {statuses.map((status, index) =>
                editingId === status.id ? (
                  <div key={status.id} className="bg-muted/20 p-4">
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-name-${status.id}`}>{t("name")}</Label>
                          <Input
                            id={`edit-name-${status.id}`}
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            autoComplete="off"
                            name="name"
                          />
                        </div>
                        <ColorSelect label={t("color")} value={editColor} onChange={setEditColor} />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`edit-roadmap-${status.id}`}
                          checked={editShowInRoadmap}
                          onCheckedChange={setEditShowInRoadmap}
                        />
                        <Label htmlFor={`edit-roadmap-${status.id}`}>{t("showInRoadmap")}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void handleUpdate(status.id)}>
                          {tc("save")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                          {tc("cancel")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={status.id}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
                  >
                    <GripVertical className="size-5 shrink-0 cursor-move text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge color={status.color} size="lg">
                          {status.name}
                        </StatusBadge>
                        {status.showInRoadmap ? (
                          <Badge variant="default" className="text-[10px]">
                            {t("shownInRoadmap")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            {t("notShownInRoadmap")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        title={t("moveUp")}
                        onClick={() => void handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        title={t("moveDown")}
                        onClick={() => void handleMoveDown(index)}
                        disabled={index === statuses.length - 1}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 h-5" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditingId(status.id);
                          setEditName(status.name);
                          setEditColor(status.color);
                          setEditShowInRoadmap(status.showInRoadmap);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => void handleDelete(status.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 border-t bg-muted/30 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="new-status-name">{t("name")}</Label>
              <Input
                id="new-status-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoComplete="off"
                name="new-name"
                placeholder={t("name")}
              />
            </div>
            <ColorSelect label={t("color")} value={newColor} onChange={setNewColor} />
            <div className="flex items-end gap-3 pb-0.5">
              <Switch id="new-roadmap" checked={newShowInRoadmap} onCheckedChange={setNewShowInRoadmap} />
              <Label htmlFor="new-roadmap">{t("showInRoadmap")}</Label>
            </div>
          </div>
          <Button className="self-start" onClick={() => void handleCreate()} disabled={!newName}>
            <Plus className="mr-1 size-4" />
            {t("addStatus")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
