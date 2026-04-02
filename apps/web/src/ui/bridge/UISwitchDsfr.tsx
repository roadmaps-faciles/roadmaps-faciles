"use client";

import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

import { type UISwitchProps } from "./UISwitch";

export const UISwitchDsfr = ({ label, checked, onCheckedChangeAction, disabled, className }: UISwitchProps) => (
  <ToggleSwitch
    label={label}
    inputTitle={typeof label === "string" ? label : ""}
    checked={checked}
    onChange={onCheckedChangeAction}
    disabled={disabled}
    className={className}
  />
);
