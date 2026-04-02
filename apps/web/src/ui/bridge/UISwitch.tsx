"use client";

import { Switch as ShadcnSwitch } from "@roadmaps-faciles/ui";
import { lazy, Suspense, useId } from "react";

import { useUI } from "@/ui";

const UISwitchDsfr = lazy(() => import("./UISwitchDsfr").then(m => ({ default: m.UISwitchDsfr })));

export type UISwitchProps = {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  /** Label displayed next to the switch — required for RGAA (a11y) */
  label: React.ReactNode;
  onCheckedChangeAction: (checked: boolean) => void;
};

export const UISwitch = ({ label, checked, onCheckedChangeAction, disabled, className }: UISwitchProps) => {
  const theme = useUI();
  const id = useId();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UISwitchDsfr
          label={label}
          checked={checked}
          onCheckedChangeAction={onCheckedChangeAction}
          disabled={disabled}
          className={className}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ShadcnSwitch id={id} checked={checked} onCheckedChange={onCheckedChangeAction} disabled={disabled} />
      <label htmlFor={id} className="cursor-pointer text-sm">
        {label}
      </label>
    </div>
  );
};
