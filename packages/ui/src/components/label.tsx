"use client";

/** Accessible form label. Automatically disables when associated input is disabled. */

import { Label as LabelPrimitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:cursor-not-allowed group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
