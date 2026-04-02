/** Callout banners for contextual feedback. Compound: `Alert` > `AlertTitle` + `AlertDescription`. */

import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

/**
 * Alert style variants.
 * - `default` -- Neutral card background
 * - `destructive` -- Red error/danger
 * - `success` -- Green positive feedback
 * - `warning` -- Amber caution
 */
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive dark:text-destructive-foreground bg-destructive/5 dark:bg-destructive-foreground/10 border-destructive/20 dark:border-destructive-foreground/20 [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 dark:*:data-[slot=alert-description]:text-destructive-foreground/90",
        success:
          "text-success bg-success/5 dark:bg-success/10 border-success/20 dark:border-success/20 [&>svg]:text-current *:data-[slot=alert-description]:text-success/90",
        warning:
          "text-warning bg-warning/5 dark:bg-warning/10 border-warning/20 dark:border-warning/20 [&>svg]:text-current *:data-[slot=alert-description]:text-warning/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({ className, variant, ...props }: ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
