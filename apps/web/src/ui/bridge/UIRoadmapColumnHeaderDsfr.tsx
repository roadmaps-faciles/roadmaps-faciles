import { cn } from "@roadmaps-faciles/ui";

import { type PostStatusColor } from "@/lib/model/PostStatus";

export interface UIRoadmapColumnHeaderDsfrProps {
  color: null | PostStatusColor;
  count: number;
  label: string;
}

export const UIRoadmapColumnHeaderDsfr = ({ color, label, count }: UIRoadmapColumnHeaderDsfrProps) => {
  // globals.scss generates `.fr-roadmap-column--color-{camelCaseKey}` so we feed the raw enum value, not the kebab map
  const dsfrClass = color ? `fr-roadmap-column--color-${color}` : undefined;
  return (
    <div className={cn(dsfrClass, "flex items-center justify-between gap-2 rounded-[10px] px-3 py-2.5")}>
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      <span className="text-[11px] font-semibold tabular-nums opacity-70">{count}</span>
    </div>
  );
};
