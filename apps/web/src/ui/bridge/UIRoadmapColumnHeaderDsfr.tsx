import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import { type PostStatusColor } from "@/lib/model/PostStatus";
import { getTone, TONE_TO_DSFR_SEVERITY } from "@/lib/utils/postStatusTone";

export interface UIRoadmapColumnHeaderDsfrProps {
  color: null | PostStatusColor;
  count: number;
  label: string;
}

export const UIRoadmapColumnHeaderDsfr = ({ color, label, count }: UIRoadmapColumnHeaderDsfrProps) => {
  const severity = TONE_TO_DSFR_SEVERITY[getTone(color)];

  return (
    <h2 className={cx("fr-h6 fr-mb-2w", "flex items-center gap-2")}>
      {label}
      <Badge severity={severity ?? undefined} small noIcon={severity === null}>
        {String(count)}
      </Badge>
    </h2>
  );
};
