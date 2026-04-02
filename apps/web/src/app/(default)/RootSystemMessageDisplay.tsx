import { Button } from "@roadmaps-faciles/ui";
import { AlertTriangle, Clock, Lock, Search, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";

const ICON_MAP = {
  clock: Clock,
  error: AlertTriangle,
  lock: Lock,
  search: Search,
  wrench: Wrench,
};

/** Background + icon color per error type for the illustration circle. */
const COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  lock: { bg: "bg-amber-100 dark:bg-amber-950", fg: "text-amber-600 dark:text-amber-400" },
  search: { bg: "bg-blue-100 dark:bg-blue-950", fg: "text-blue-600 dark:text-blue-400" },
  error: { bg: "bg-red-100 dark:bg-red-950", fg: "text-red-600 dark:text-red-400" },
  wrench: { bg: "bg-orange-100 dark:bg-orange-950", fg: "text-orange-600 dark:text-orange-400" },
  clock: { bg: "bg-violet-100 dark:bg-violet-950", fg: "text-violet-600 dark:text-violet-400" },
};

const SYSTEM_CODE_ICONS: Record<string, keyof typeof ICON_MAP> = {
  "401": "lock",
  "403": "lock",
  "404": "search",
  "500": "error",
  construction: "wrench",
  maintenance: "clock",
};

const SYSTEM_CODE_ALIASES: Record<string, string> = {
  unauthorized: "401",
  forbidden: "403",
  "not-found": "404",
  "login-AuthorizedCallbackError": "401",
  "login-AccessDenied": "401",
};

export type RootSystemCode = keyof typeof SYSTEM_CODE_ALIASES;

export const VALID_ROOT_SYSTEM_CODES = new Set([
  ...Object.keys(SYSTEM_CODE_ICONS),
  ...Object.keys(SYSTEM_CODE_ALIASES),
]);

export type RootSystemMessageDisplayProps = RootSystemMessageDisplayProps.WithCode &
  RootSystemMessageDisplayProps.WithRedirect;

namespace RootSystemMessageDisplayProps {
  export type WithRedirect =
    | {
        noRedirect: true;
        redirectLink?: never;
        redirectText?: never;
      }
    | {
        noRedirect?: never;
        redirectLink?: LinkProps<string>["href"];
        redirectText?: string;
      };

  export type WithCode =
    | {
        body: ReactNode;
        code: "custom";
        headline: string;
        icon?: keyof typeof ICON_MAP;
        title: string;
      }
    | {
        body?: never;
        code: RootSystemCode;
        headline?: never;
        icon?: never;
        title?: never;
      };
}

export const RootSystemMessageDisplay = async ({
  code,
  noRedirect,
  body,
  headline,
  title,
  icon = "error",
  redirectLink = "/",
  redirectText,
}: RootSystemMessageDisplayProps) => {
  const t = await getTranslations("errors");

  if (code !== "custom") {
    const resolvedCode = SYSTEM_CODE_ALIASES[code] ?? code;
    body = t(`${resolvedCode}.body` as "401.body");
    headline = t(`${resolvedCode}.headline` as "401.headline");
    title = t(`${resolvedCode}.title` as "401.title");
    icon = SYSTEM_CODE_ICONS[resolvedCode] ?? "error";
    code = resolvedCode;
  }

  if (!redirectText) redirectText = t("homepage");

  const IconComponent = ICON_MAP[icon];
  const colors = COLOR_MAP[icon] ?? COLOR_MAP.error;

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="my-16 flex flex-col items-center gap-8 md:my-24 md:flex-row md:gap-12">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {!isNaN(+code) && <p className="text-sm text-muted-foreground">{t("errorCode", { code })}</p>}
          <p className="text-lg text-muted-foreground">{headline}</p>
          <div className="text-sm text-muted-foreground">{body}</div>
          {!noRedirect && (
            <div className="pt-4">
              <Button asChild>
                <Link href={redirectLink}>{redirectText}</Link>
              </Button>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-center">
          <div className={`flex size-32 items-center justify-center rounded-full md:size-40 ${colors.bg}`}>
            <IconComponent className={`size-16 md:size-20 ${colors.fg}`} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
};
