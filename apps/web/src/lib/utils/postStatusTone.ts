import { type PostStatusColor } from "@/lib/model/PostStatus";

export type RoadmapTone = "accent" | "destructive" | "muted" | "primary" | "success" | "warning";

export const POST_STATUS_COLOR_TONE: Record<PostStatusColor, RoadmapTone> = {
  grey: "muted",
  gray: "muted",
  blueFrance: "primary",
  blueEcume: "primary",
  blueCumulus: "primary",
  info: "primary",
  greenTilleulVerveine: "success",
  greenBourgeon: "success",
  greenEmeraude: "success",
  greenMenthe: "success",
  greenArchipel: "success",
  success: "success",
  yellowTournesol: "warning",
  yellowMoutarde: "warning",
  orangeTerreBattue: "warning",
  warning: "warning",
  redMarianne: "destructive",
  pinkMacaron: "destructive",
  pinkTuile: "destructive",
  error: "destructive",
  purpleGlycine: "accent",
  brownCafeCreme: "muted",
  brownCaramel: "muted",
  brownOpera: "muted",
  beigeGrisGalet: "muted",
};

interface ToneClasses {
  bg: string;
  border: string;
  cardBorder: string;
  dot: string;
  text: string;
}

export const ROADMAP_TONE_CLASSES: Record<RoadmapTone, ToneClasses> = {
  primary: {
    border: "border-primary/25 dark:border-primary/40",
    bg: "bg-primary/[0.06] dark:bg-primary/15",
    text: "text-primary dark:text-primary-foreground",
    dot: "bg-primary",
    cardBorder: "border-primary/20 dark:border-primary/30",
  },
  success: {
    border: "border-emerald-300/60 dark:border-emerald-400/25",
    bg: "bg-emerald-50/60 dark:bg-emerald-400/10",
    text: "text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    cardBorder: "border-emerald-200/60 dark:border-emerald-400/20",
  },
  warning: {
    border: "border-amber-300/60 dark:border-amber-400/25",
    bg: "bg-amber-50/60 dark:bg-amber-400/10",
    text: "text-amber-900 dark:text-amber-200",
    dot: "bg-amber-500 dark:bg-amber-400",
    cardBorder: "border-amber-200/60 dark:border-amber-400/20",
  },
  destructive: {
    border: "border-rose-300/60 dark:border-rose-400/25",
    bg: "bg-rose-50/60 dark:bg-rose-400/10",
    text: "text-rose-900 dark:text-rose-200",
    dot: "bg-rose-500 dark:bg-rose-400",
    cardBorder: "border-rose-200/60 dark:border-rose-400/20",
  },
  accent: {
    border: "border-violet-300/60 dark:border-violet-400/25",
    bg: "bg-violet-50/60 dark:bg-violet-400/10",
    text: "text-violet-900 dark:text-violet-200",
    dot: "bg-violet-500 dark:bg-violet-400",
    cardBorder: "border-violet-200/60 dark:border-violet-400/20",
  },
  muted: {
    border: "border-border",
    bg: "bg-muted/40",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    cardBorder: "border-border/30",
  },
};

export const getTone = (color: null | PostStatusColor): RoadmapTone =>
  color ? POST_STATUS_COLOR_TONE[color] : "muted";

export type DsfrBadgeSeverity = "error" | "info" | "new" | "success" | "warning";

export const TONE_TO_DSFR_SEVERITY: Record<RoadmapTone, DsfrBadgeSeverity | null> = {
  primary: "info",
  success: "success",
  warning: "warning",
  destructive: "error",
  accent: "new",
  muted: null,
};
