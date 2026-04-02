/** Hint text below form fields. Two variants: `description` (muted) and `error` (destructive with icon). */

import { CircleAlertIcon } from "lucide-react";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

function Hint({
  className,
  variant = "description",
  children,
  ...props
}: { variant?: "description" | "error" } & ComponentProps<"p">) {
  return (
    <p
      data-slot="hint"
      data-variant={variant}
      className={cn(
        "flex items-center gap-1 text-xs",
        variant === "description" && "text-muted-foreground",
        variant === "error" && "text-destructive",
        className,
      )}
      {...props}
    >
      {variant === "error" && <CircleAlertIcon className="size-3.5 shrink-0" />}
      {children}
    </p>
  );
}

export { Hint };
