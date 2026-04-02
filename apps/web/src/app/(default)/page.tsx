import { Badge, Button, Card, Input } from "@roadmaps-faciles/ui";
import {
  ArrowRight,
  LayoutDashboard,
  Lightbulb,
  Plug,
  Share2,
  StickyNote,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  Vote,
} from "lucide-react";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { sharedMetadata } from "../shared-metadata";

const url = "/";

export const metadata: Metadata = {
  ...sharedMetadata,
  openGraph: {
    ...sharedMetadata.openGraph,
    url,
  },
  alternates: {
    canonical: url,
  },
};

const Home = async (_: PageProps<"/">) => {
  const t = await getTranslations("home");

  return (
    <>
      {/* Hero */}
      <section className="px-6 py-24 text-center md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex justify-center">
            <Badge variant="outline" className="flex gap-2 px-3 py-1">
              <span className="font-bold text-primary">BETA</span>
              <span className="border-l border-border pl-2 text-muted-foreground">{t("badge")}</span>
            </Badge>
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("description")}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full px-8 py-6 text-base sm:w-auto">
              <Link href="/workspaces">
                {t("cta")} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full px-8 py-6 text-base sm:w-auto">
              <Link href="/doc">{t("ctaDoc")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="sr-only">{t("bento.roadmap.title")}</h2>
          <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-12">
            {/* Roadmap collaborative — 8col, 2row */}
            <Card className="border-border/40 p-8 shadow-none md:col-span-8 md:row-span-2">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{t("bento.roadmap.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("bento.roadmap.description")}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                  {t("bento.roadmap.badgePublic")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Column: À étudier */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t("bento.roadmap.colStudy")}
                    </span>
                  </div>
                  <Card className="border-border/30 bg-muted/30 p-4 shadow-none">
                    <p className="mb-3 text-sm font-medium">{t("bento.roadmap.itemPayment")}</p>
                    <Badge className="border-amber-200 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                      {t("bento.roadmap.badgePriority")}
                    </Badge>
                  </Card>
                  <Card className="border-border/30 bg-muted/30 p-4 shadow-none">
                    <p className="mb-3 text-sm font-medium">{t("bento.roadmap.itemFranceConnect")}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {t("bento.roadmap.badgeStudy")}
                    </Badge>
                  </Card>
                </div>

                {/* Column: En cours */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t("bento.roadmap.colInProgress")}
                    </span>
                  </div>
                  <Card className="border-primary/20 bg-primary/[0.02] p-4 shadow-none">
                    <p className="mb-3 text-sm font-medium text-primary">{t("bento.roadmap.itemMobile")}</p>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-2/3 bg-primary" />
                    </div>
                  </Card>
                </div>

                {/* Column: Livré */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t("bento.roadmap.colDone")}
                    </span>
                  </div>
                  <Card className="border-emerald-100/50 bg-emerald-50/20 p-4 shadow-none dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <p className="mb-3 text-sm font-medium text-muted-foreground line-through">
                      {t("bento.roadmap.itemMultilang")}
                    </p>
                    <Badge className="border-emerald-200 bg-emerald-100 text-[10px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      {t("bento.roadmap.badgeDone")}
                    </Badge>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Vote citoyen — 4col, 2row */}
            <Card className="border-border/40 bg-muted/30 p-8 shadow-none md:col-span-4 md:row-span-2">
              <div className="mb-6 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Vote className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t("bento.vote.title")}</h3>
              <p className="mb-8 text-sm text-muted-foreground">{t("bento.vote.description")}</p>

              <Card className="space-y-4 border-border/30 bg-background p-5 shadow-none" aria-hidden="true">
                <div className="flex items-center justify-between">
                  <label htmlFor="vote-suggest-demo" className="text-xs font-semibold text-muted-foreground">
                    {t("bento.vote.suggestLabel")}
                  </label>
                  <Lightbulb className="size-4 text-muted-foreground" />
                </div>
                <Input
                  id="vote-suggest-demo"
                  placeholder={t("bento.vote.suggestPlaceholder")}
                  className="text-xs italic"
                  readOnly
                  tabIndex={-1}
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 flex-1 px-0" tabIndex={-1} aria-label="Dislike">
                    <ThumbsDown className="size-4" />
                  </Button>
                  <Button className="h-9 flex-1 px-0" tabIndex={-1}>
                    <ThumbsUp className="mr-2 size-4" />
                    <span className="text-xs">{t("bento.vote.voteButton")}</span>
                  </Button>
                </div>
              </Card>

              <div className="mt-4 flex items-center justify-between px-2">
                <span className="text-[10px] font-medium text-muted-foreground">{t("bento.vote.lastVote")}</span>
                <div className="flex -space-x-1.5">
                  <div className="size-6 rounded-full border-2 border-background bg-primary/20 ring-1 ring-border" />
                  <div className="size-6 rounded-full border-2 border-background bg-primary/40 ring-1 ring-border" />
                </div>
              </div>
            </Card>

            {/* Satisfaction — 4col */}
            <Card className="relative flex flex-col justify-between overflow-hidden border-border/40 p-8 shadow-none md:col-span-4">
              <div>
                <h3 className="text-base font-semibold">{t("bento.satisfaction.title")}</h3>
                <p className="text-xs text-muted-foreground">{t("bento.satisfaction.description")}</p>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="text-4xl font-bold tracking-tight text-primary">89%</div>
                <div className="flex h-12 flex-1 items-end gap-1.5 pb-1">
                  <div className="h-[30%] w-full rounded-sm bg-primary/10" />
                  <div className="h-[50%] w-full rounded-sm bg-primary/10" />
                  <div className="h-[40%] w-full rounded-sm bg-primary/20" />
                  <div className="h-[70%] w-full rounded-sm bg-primary/30" />
                  <div className="h-full w-full rounded-sm bg-primary" />
                </div>
              </div>
            </Card>

            {/* Intégrations — 8col */}
            <Card className="flex flex-col justify-center border-border/40 p-8 shadow-none md:col-span-8">
              <div className="mb-8 flex items-center gap-2">
                <Plug className="size-5 text-primary" />
                <h3 className="text-base font-semibold">{t("bento.integrations.title")}</h3>
              </div>
              <div className="flex flex-wrap items-center justify-around gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/[0.02] text-primary">
                    <StickyNote className="size-6" />
                  </div>
                  <span className="text-[10px] font-bold text-primary">{t("bento.integrations.notion")}</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-30 grayscale">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted">
                    <LayoutDashboard className="size-6" />
                  </div>
                  <span className="text-[10px] font-bold">{t("bento.integrations.jira")}</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-30 grayscale">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted">
                    <Terminal className="size-6" />
                  </div>
                  <span className="text-[10px] font-bold">{t("bento.integrations.slack")}</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-30 grayscale">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted">
                    <Share2 className="size-6" />
                  </div>
                  <span className="text-[10px] font-bold">{t("bento.integrations.linear")}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-2xl bg-primary px-12 py-20 text-center text-primary-foreground md:py-24">
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">{t("ctaSection.title")}</h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-primary-foreground/80">{t("ctaSection.description")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground px-10 py-4 text-lg font-bold !text-primary hover:bg-primary-foreground/90 hover:!text-primary"
              >
                <Link href="/workspaces">{t("ctaSection.cta")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="border border-primary-foreground/20 px-10 py-4 text-lg font-bold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/doc">{t("ctaSection.contact")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
