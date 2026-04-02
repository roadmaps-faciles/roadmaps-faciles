"use client";

import { Alert as ShadcnAlert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { X } from "lucide-react";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UIAlertDsfr = lazy(() => import("./UIAlertDsfr").then(m => ({ default: m.UIAlertDsfr })));

export type UIAlertProps = {
  className?: string;
  closable?: boolean;
  description?: React.ReactNode;
  onClose?: () => void;
  title?: React.ReactNode;
  /** Alert style variant — maps to DSFR `severity` internally */
  variant: "default" | "destructive" | "success" | "warning";
};

export const UIAlert = ({ variant, title, description, className, closable, onClose }: UIAlertProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIAlertDsfr
          variant={variant}
          title={title}
          description={description}
          className={className}
          closable={closable}
          onClose={onClose}
        />
      </Suspense>
    );
  }

  return (
    <ShadcnAlert variant={variant} className={className}>
      <div className="col-start-2 flex items-start justify-between gap-2">
        <div>
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        {closable && onClose && (
          <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </div>
    </ShadcnAlert>
  );
};
