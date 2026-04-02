/** Auto-sizing textarea with `field-sizing: content`. Minimum height 64px. */

import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground ui-focus-ring ui-invalid-ring dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none ui-disabled md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
