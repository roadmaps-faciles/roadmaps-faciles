import { cn } from "@roadmaps-faciles/ui";

import { type UIRoadmapStatGridProps } from "./UIRoadmapStatGrid";

export const UIRoadmapStatGridDsfr = ({ stats, className }: UIRoadmapStatGridProps) => {
  if (stats.length === 0) return null;

  return (
    <div className={cn("fr-grid-row fr-grid-row--gutters", className)}>
      {stats.map((stat, i) => (
        <div key={`${stat.label}-${i}`} className="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <div className="fr-tile fr-tile--sm fr-tile--no-icon">
            <div className="fr-tile__body">
              <div className="fr-tile__content">
                <p className="fr-tile__detail">{stat.label}</p>
                <h3 className="fr-tile__title">{stat.value}</h3>
                {stat.sublabel && <p className="fr-tile__desc">{stat.sublabel}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
