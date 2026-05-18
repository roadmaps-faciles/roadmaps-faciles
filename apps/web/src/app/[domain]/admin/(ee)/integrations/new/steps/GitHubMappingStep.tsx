"use client";

import { Alert, AlertDescription, Button, Input, Label } from "@roadmaps-faciles/ui";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { type Board, type PostStatus } from "@/prisma/client";

import { createBoard } from "../../../../boards/actions";
import { createPostStatus } from "../../../../statuses/actions";
import { useGitHubWizardStore } from "../useGitHubWizardStore";

interface GitHubMappingStepProps {
  boards: Board[];
  statuses: PostStatus[];
}

const NativeSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  />
);

export const GitHubMappingStep = ({ boards, statuses }: GitHubMappingStepProps) => {
  const t = useTranslations("domainAdmin.integrations.github.wizard");
  const tWizard = useTranslations("domainAdmin.integrations.wizard");
  const { schema, statusMapping, boardMapping, setStatusMapping, setBoardMapping } = useGitHubWizardStore();

  const [additionalStatuses, setAdditionalStatuses] = useState<Array<{ id: number; name: string }>>([]);
  const [additionalBoards, setAdditionalBoards] = useState<Array<{ id: number; name: string }>>([]);

  const allStatuses = useMemo(
    () => [...statuses, ...additionalStatuses.map(s => ({ ...s }) as PostStatus)],
    [statuses, additionalStatuses],
  );
  const allBoards = useMemo(
    () => [...boards, ...additionalBoards.map(b => ({ ...b }) as Board)],
    [boards, additionalBoards],
  );

  const labelOptions = useMemo(() => {
    if (!schema) return [];
    const statusProp = schema.properties.find(p => p.name === "labels");
    return statusProp?.options ?? [];
  }, [schema]);

  const milestoneOptions = useMemo(() => {
    if (!schema) return [];
    const boardProp = schema.properties.find(p => p.name === "milestone");
    return boardProp?.options ?? [];
  }, [schema]);

  const [creatingStatusForOptionId, setCreatingStatusForOptionId] = useState<null | string>(null);
  const [newStatusName, setNewStatusName] = useState("");
  const [creatingStatusLoading, setCreatingStatusLoading] = useState(false);

  const [creatingBoardForOptionId, setCreatingBoardForOptionId] = useState<null | string>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [creatingBoardLoading, setCreatingBoardLoading] = useState(false);

  const handleCreateStatus = useCallback(
    async (optionId: string, optionName: string) => {
      if (!newStatusName.trim()) return;
      setCreatingStatusLoading(true);
      const result = await createPostStatus({
        name: newStatusName.trim(),
        color: "grey",
        showInRoadmap: true,
      });
      setCreatingStatusLoading(false);
      if (result.ok) {
        setAdditionalStatuses(prev => [...prev, { id: result.data.id, name: result.data.name }]);
        setStatusMapping(optionId, { localId: result.data.id, remoteName: optionName });
        setCreatingStatusForOptionId(null);
        setNewStatusName("");
      }
    },
    [newStatusName, setStatusMapping],
  );

  const handleCreateBoard = useCallback(
    async (optionId: string, optionName: string) => {
      if (!newBoardName.trim()) return;
      setCreatingBoardLoading(true);
      const result = await createBoard({ name: newBoardName.trim() });
      setCreatingBoardLoading(false);
      if (result.ok) {
        setAdditionalBoards(prev => [...prev, { id: result.data.id, name: result.data.name }]);
        setBoardMapping(optionId, { localId: result.data.id, remoteName: optionName });
        setCreatingBoardForOptionId(null);
        setNewBoardName("");
      }
    },
    [newBoardName, setBoardMapping],
  );

  if (!schema) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{tWizard("noSchema")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <p>{t("mappingDescription")}</p>

      <h4 className="text-lg font-semibold">{t("statusMappingTitle")}</h4>
      <p className="text-sm text-muted-foreground">{t("statusMappingDescription")}</p>

      {labelOptions.length === 0 ? (
        <Alert>
          <AlertDescription>{t("noLabels")}</AlertDescription>
        </Alert>
      ) : (
        <div className="ml-4 space-y-4">
          {labelOptions.map(opt => (
            <div key={opt.id}>
              {creatingStatusForOptionId === opt.id ? (
                <div className="space-y-2">
                  <p className="font-medium">{opt.name}</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label>{tWizard("newStatusName")}</Label>
                      <Input
                        value={newStatusName}
                        onChange={e => setNewStatusName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleCreateStatus(opt.id, opt.name);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => void handleCreateStatus(opt.id, opt.name)}
                      disabled={!newStatusName.trim() || creatingStatusLoading}
                    >
                      {creatingStatusLoading ? tWizard("creating") : tWizard("create")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCreatingStatusForOptionId(null);
                        setNewStatusName("");
                      }}
                    >
                      {tWizard("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label>{opt.name}</Label>
                    <NativeSelect
                      value={statusMapping[opt.id]?.localId ?? ""}
                      onChange={e => {
                        const localId = Number(e.target.value);
                        if (localId) {
                          setStatusMapping(opt.id, { localId, remoteName: opt.name });
                        }
                      }}
                    >
                      <option value="">{tWizard("notMapped")}</option>
                      {allStatuses.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCreatingStatusForOptionId(opt.id);
                      setNewStatusName(opt.name);
                    }}
                  >
                    <Plus className="mr-1 size-3" />
                    {tWizard("createNew")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h4 className="text-lg font-semibold">{t("boardMappingTitle")}</h4>
      <p className="text-sm text-muted-foreground">{t("boardMappingDescription")}</p>

      {milestoneOptions.length === 0 ? (
        <Alert>
          <AlertDescription>{t("noMilestones")}</AlertDescription>
        </Alert>
      ) : (
        <div className="ml-4 space-y-4">
          {milestoneOptions.map(opt => (
            <div key={opt.id}>
              {creatingBoardForOptionId === opt.id ? (
                <div className="space-y-2">
                  <p className="font-medium">{opt.name}</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label>{tWizard("newBoardName")}</Label>
                      <Input
                        value={newBoardName}
                        onChange={e => setNewBoardName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleCreateBoard(opt.id, opt.name);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => void handleCreateBoard(opt.id, opt.name)}
                      disabled={!newBoardName.trim() || creatingBoardLoading}
                    >
                      {creatingBoardLoading ? tWizard("creating") : tWizard("create")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCreatingBoardForOptionId(null);
                        setNewBoardName("");
                      }}
                    >
                      {tWizard("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label>{opt.name}</Label>
                    <NativeSelect
                      value={boardMapping[opt.id]?.localId ?? ""}
                      onChange={e => {
                        const localId = Number(e.target.value);
                        if (localId) {
                          setBoardMapping(opt.id, { localId, remoteName: opt.name });
                        }
                      }}
                    >
                      <option value="">{tWizard("notMapped")}</option>
                      {allBoards.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCreatingBoardForOptionId(opt.id);
                      setNewBoardName(opt.name);
                    }}
                  >
                    <Plus className="mr-1 size-3" />
                    {tWizard("createNew")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {milestoneOptions.length === 0 && labelOptions.length === 0 && (
        <Alert>
          <AlertDescription>{tWizard("defaultBoardInfo")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
