"use client";

import { cn } from "@roadmaps-faciles/ui";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UINoticeDsfr = lazy(() => import("./UINoticeDsfr").then(m => ({ default: m.UINoticeDsfr })));

export type UINoticeProps = {
  className?: string;
  closable?: boolean;
  description?: React.ReactNode;
  link?: {
    href: string;
    target?: string;
    text: React.ReactNode;
  };
  onClose?: () => void;
  /** Severity - maps to DSFR Notice `severity` */
  severity?: "alert" | "info" | "warning";
  title: React.ReactNode;
};

const SEVERITY_STYLES = {
  alert: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-primary/5 text-foreground border-primary/20",
  warning: "bg-warning/10 text-warning border-warning/30",
} as const;

const SEVERITY_ICONS = {
  alert: CircleAlert,
  info: Info,
  warning: TriangleAlert,
} as const;

export const UINotice = ({
  severity = "info",
  title,
  description,
  link,
  closable,
  onClose,
  className,
}: UINoticeProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UINoticeDsfr
          severity={severity}
          title={title}
          description={description}
          link={link}
          closable={closable}
          onClose={onClose}
          className={className}
        />
      </Suspense>
    );
  }

  const Icon = SEVERITY_ICONS[severity];

  return (
    <div role="region" className={cn("w-full border-b", SEVERITY_STYLES[severity], className)}>
      <div className="mx-auto flex max-w-screen-xl items-center gap-3 px-4 py-3">
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-sm">
          <span className="font-semibold">{title}</span>
          {description && <span className="ml-2 font-normal">{description}</span>}
          {link && (
            <Link
              href={link.href}
              target={link.target}
              className="ml-2 font-normal underline underline-offset-2 hover:no-underline"
            >
              {link.text}
            </Link>
          )}
        </div>
        {closable && onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={onClose}
            aria-label="Masquer le message"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
