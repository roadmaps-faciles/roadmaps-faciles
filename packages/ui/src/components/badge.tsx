/** Inline status label rendered as a pill. Supports `asChild` for custom element composition. */

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

/**
 * Badge style variants.
 * - `default` -- Primary filled
 * - `secondary` -- Muted fill
 * - `destructive` -- Red danger
 * - `outline` -- Bordered, transparent background
 * - `success` -- Green positive
 * - `warning` -- Amber caution
 * - `ghost` -- No background, hover fill
 * - `link` -- Text-only with underline on hover
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none ui-focus-ring ui-invalid-ring transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: "bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning: "bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** @param asChild When `true`, merges props onto the child element via Radix `Slot`. */
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: { asChild?: boolean } & ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
