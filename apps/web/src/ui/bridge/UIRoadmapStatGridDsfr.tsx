import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import { type UIRoadmapStatGridProps } from "./UIRoadmapStatGrid";

export const UIRoadmapStatGridDsfr = ({ stats, className }: UIRoadmapStatGridProps) => {
  if (stats.length === 0) return null;

  return (
    <div className={cx("fr-grid-row fr-grid-row--gutters", className)}>
      {stats.map((stat, i) => (
        <div key={`${stat.label}-${i}`} className="fr-col-12 fr-col-md-4">
          <CallOut colorVariant="blue-cumulus" title={String(stat.value)} titleAs="p">
            {stat.label}
            {stat.sublabel ? ` — ${stat.sublabel}` : ""}
          </CallOut>
        </div>
      ))}
    </div>
  );
};
