"use client";

import { cn, Input as ShadcnInput, Label as ShadcnLabel } from "@roadmaps-faciles/ui";
import { lazy, Suspense, useId } from "react";

import { useUI } from "@/ui";

const UIInputDsfr = lazy(() => import("./UIInputDsfr").then(m => ({ default: m.UIInputDsfr })));

export type UIInputProps = {
  className?: string;
  disabled?: boolean;
  hintText?: string;
  label: React.ReactNode;
  nativeInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  state?: "default" | "error" | "success";
  stateRelatedMessage?: string;
  textArea?: boolean;
};

export const UIInput = ({
  label,
  hintText,
  nativeInputProps,
  state = "default",
  stateRelatedMessage,
  className,
  disabled,
  textArea,
}: UIInputProps) => {
  const theme = useUI();
  const fallbackId = useId();
  const inputId = nativeInputProps?.id ?? fallbackId;

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIInputDsfr
          label={label}
          hintText={hintText}
          nativeInputProps={nativeInputProps}
          state={state}
          stateRelatedMessage={stateRelatedMessage}
          className={className}
          disabled={disabled}
          textArea={textArea}
        />
      </Suspense>
    );
  }

  return (
    <div className={cn("grid w-full gap-1.5", className)}>
      <ShadcnLabel htmlFor={inputId}>{label}</ShadcnLabel>
      {hintText && <p className="text-sm text-muted-foreground">{hintText}</p>}
      {textArea ? (
        <textarea
          id={inputId}
          disabled={disabled}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            state === "error" && "border-destructive",
            state === "success" && "border-green-500",
          )}
          {...(nativeInputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <ShadcnInput
          id={inputId}
          disabled={disabled}
          className={cn(state === "error" && "border-destructive", state === "success" && "border-green-500")}
          {...nativeInputProps}
        />
      )}
      {stateRelatedMessage && (
        <p className={cn("text-sm", state === "error" && "text-destructive", state === "success" && "text-green-600")}>
          {stateRelatedMessage}
        </p>
      )}
    </div>
  );
};
