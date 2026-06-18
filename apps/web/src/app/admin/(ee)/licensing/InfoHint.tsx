"use client";

import { Info } from "lucide-react";

import { UITooltip } from "@/ui/bridge/UITooltip";

export const InfoHint = ({ hint }: { hint: string }) => (
  <UITooltip title={hint}>
    <Info className="size-3.5 shrink-0 cursor-help text-muted-foreground/60" />
  </UITooltip>
);
