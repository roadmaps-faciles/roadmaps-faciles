import { Bell, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type RoadmapStat, UIButton, UIRoadmapStatGrid, UITooltip } from "@/ui/bridge";

interface RoadmapHeroProps {
  stats: RoadmapStat[];
  suggestUrl: null | string;
  tenantName: string;
}

export const RoadmapHero = async ({ tenantName, suggestUrl, stats }: RoadmapHeroProps) => {
  const t = await getTranslations("roadmap");

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3">{t("hero.eyebrow")}</div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
              {t("hero.title", { tenantName })}
            </h1>
            <p className="mt-3 text-base/relaxed text-muted-foreground">{t("hero.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <UITooltip title={t("hero.ctaSubscribeTooltip")}>
              <UIButton size="sm" variant="outline" disabled>
                <Bell className="size-4" />
                {t("hero.ctaSubscribe")}
              </UIButton>
            </UITooltip>
            {suggestUrl ? (
              <UIButton size="sm" variant="default" linkProps={{ href: suggestUrl }}>
                <Plus className="size-4" />
                {t("hero.ctaSuggest")}
              </UIButton>
            ) : (
              <UITooltip title={t("hero.ctaSuggestUnavailable")}>
                <UIButton size="sm" variant="default" disabled>
                  <Plus className="size-4" />
                  {t("hero.ctaSuggest")}
                </UIButton>
              </UITooltip>
            )}
          </div>
        </div>
        {stats.length > 0 && <UIRoadmapStatGrid stats={stats} className="mt-8" />}
      </div>
    </section>
  );
};
