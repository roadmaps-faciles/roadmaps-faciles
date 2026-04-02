/** Polymorphic button with variant and size support. Supports `asChild` for custom element composition. */

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

/**
 * Button style variants.
 * - `default` -- Primary filled button
 * - `destructive` -- Red danger action
 * - `outline` -- Bordered, transparent background
 * - `secondary` -- Muted fill
 * - `ghost` -- No background, hover fill
 * - `link` -- Text-only with underline
 *
 * Sizes: `default` (h-9), `xs` (h-6), `sm` (h-8), `lg` (h-10),
 * `icon` (square 36px), `icon-xs` (24px), `icon-sm` (32px), `icon-lg` (40px)
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all ui-disabled ui-svg-icon shrink-0 outline-none ui-focus-ring ui-invalid-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** @param asChild When `true`, merges props onto the child element via Radix `Slot`. */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: {
  asChild?: boolean;
} & ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
