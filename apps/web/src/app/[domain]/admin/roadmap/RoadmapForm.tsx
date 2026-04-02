"use client";

import { Button } from "@roadmaps-faciles/ui/components/button";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roadmaps-faciles/ui/components/select";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { type Board } from "@/prisma/client";

import { saveRoadmapSettings } from "./actions";

interface RoadmapFormProps {
  boards: Board[];
  currentRootBoardId: null | number;
}

export const RoadmapForm = ({ boards, currentRootBoardId }: RoadmapFormProps) => {
  const t = useTranslations("domainAdmin.roadmap");
  const tc = useTranslations("common");
  const [rootBoardId, setRootBoardId] = useState<null | number>(currentRootBoardId);

  const handleSave = async () => {
    await saveRoadmapSettings({ rootBoardId });
  };

  return (
    <div className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="root-board">{t("rootBoard")}</Label>
        <Select
          value={rootBoardId ? String(rootBoardId) : "_none"}
          onValueChange={v => setRootBoardId(v === "_none" ? null : Number(v))}
        >
          <SelectTrigger id="root-board">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">{t("none")}</SelectItem>
            {boards.map(b => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => void handleSave()}>{tc("save")}</Button>
    </div>
  );
};
