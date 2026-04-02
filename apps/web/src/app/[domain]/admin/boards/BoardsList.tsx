"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Textarea,
} from "@roadmaps-faciles/ui";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Markdown from "react-markdown";

import { type Board } from "@/prisma/client";
import { reactMarkdownConfig } from "@/utils/react-markdown";

import { createBoard, deleteBoard, reorderBoards, updateBoard } from "./actions";

interface BoardsListProps {
  boards: Board[];
}

export const BoardsList = ({ boards: initialBoards }: BoardsListProps) => {
  const t = useTranslations("domainAdmin.boards");
  const tc = useTranslations("common");
  const [boards, setBoards] = useState(initialBoards);
  const [formState, setFormState] = useState({
    new: { name: "", description: "" },
    edit: { id: null as null | number, name: "", description: "" },
  });
  const [error, setError] = useState<null | string>(null);

  const handleCreate = async () => {
    const result = await createBoard({ name: formState.new.name, description: formState.new.description });
    if (result.ok && result.data) {
      setBoards([...boards, result.data]);
      setFormState(prev => ({ ...prev, new: { name: "", description: "" } }));
      setError(null);
    } else if (!result.ok) {
      setError(result.error);
    }
  };

  const handleUpdate = async (id: number) => {
    const result = await updateBoard({ id, name: formState.edit.name, description: formState.edit.description });
    if (result.ok && result.data) {
      setBoards(boards.map(b => (b.id === id ? result.data : b)));
      setFormState(prev => ({ ...prev, edit: { id: null, name: "", description: "" } }));
      setError(null);
    } else if (!result.ok) {
      setError(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tc("areYouSure"))) return;
    const result = await deleteBoard({ id });
    if (result.ok) {
      setBoards(boards.filter(b => b.id !== id));
      setError(null);
    } else if (!result.ok) {
      setError(result.error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newBoards = [...boards];
    [newBoards[index - 1], newBoards[index]] = [newBoards[index], newBoards[index - 1]];
    const items = newBoards.map((b, i) => ({ id: b.id, order: i }));
    await reorderBoards({ items });
    setBoards(newBoards);
  };

  const handleMoveDown = async (index: number) => {
    if (index === boards.length - 1) return;
    const newBoards = [...boards];
    [newBoards[index], newBoards[index + 1]] = [newBoards[index + 1], newBoards[index]];
    const items = newBoards.map((b, i) => ({ id: b.id, order: i }));
    await reorderBoards({ items });
    setBoards(newBoards);
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{tc("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 size-6" onClick={() => setError(null)}>
            <X className="size-4" />
          </Button>
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
                {boards.length} {boards.length === 1 ? "board" : "boards"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {boards.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{t("noBoards")}</p>
          ) : (
            <div className="divide-y">
              {boards.map((board, index) =>
                formState.edit.id === board.id ? (
                  <div key={board.id} className="bg-muted/20 p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${board.id}`}>{t("name")}</Label>
                        <Input
                          id={`edit-name-${board.id}`}
                          value={formState.edit.name}
                          onChange={e =>
                            setFormState(prev => ({ ...prev, edit: { ...prev.edit, name: e.target.value } }))
                          }
                          autoComplete="off"
                          name="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-desc-${board.id}`}>{t("descriptionMarkdown")}</Label>
                        <Textarea
                          id={`edit-desc-${board.id}`}
                          value={formState.edit.description}
                          onChange={e =>
                            setFormState(prev => ({ ...prev, edit: { ...prev.edit, description: e.target.value } }))
                          }
                          autoComplete="off"
                          name="description"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void handleUpdate(board.id)}>
                          {tc("save")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFormState(prev => ({ ...prev, edit: { id: null, name: "", description: "" } }))
                          }
                        >
                          {tc("cancel")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={board.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/30">
                    <GripVertical className="size-5 shrink-0 cursor-move text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{board.name}</p>
                      {board.description ? (
                        <div className="line-clamp-1 text-xs text-muted-foreground [&_p]:inline">
                          <Markdown {...reactMarkdownConfig}>{board.description}</Markdown>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/60">{t("noDescription")}</p>
                      )}
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
                        disabled={index === boards.length - 1}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 h-5" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setFormState(prev => ({
                            ...prev,
                            edit: { id: board.id, name: board.name, description: board.description ?? "" },
                          }));
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => void handleDelete(board.id)}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">{t("name")}</Label>
              <Input
                id="new-name"
                value={formState.new.name}
                onChange={e => setFormState(prev => ({ ...prev, new: { ...prev.new, name: e.target.value } }))}
                autoComplete="off"
                name="new-name"
                placeholder={t("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">{t("descriptionMarkdown")}</Label>
              <Input
                id="new-description"
                value={formState.new.description}
                onChange={e => setFormState(prev => ({ ...prev, new: { ...prev.new, description: e.target.value } }))}
                autoComplete="off"
                name="new-description"
                placeholder={t("descriptionMarkdown")}
              />
            </div>
          </div>
          <Button className="self-start" onClick={() => void handleCreate()} disabled={!formState.new.name}>
            <Plus className="mr-1 size-4" />
            {t("addBoard")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
