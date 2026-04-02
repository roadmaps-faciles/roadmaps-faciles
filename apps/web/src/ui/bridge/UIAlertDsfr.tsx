"use client";

import DsfrAlert from "@codegouvfr/react-dsfr/Alert";

import { type UIAlertProps } from "./UIAlert";

const VARIANT_TO_SEVERITY = {
  default: "info",
  destructive: "error",
  success: "success",
  warning: "warning",
} as const;

export const UIAlertDsfr = ({ variant, title, description, className, closable, onClose }: UIAlertProps) => {
  const severity = VARIANT_TO_SEVERITY[variant];

  if (title) {
    return (
      <DsfrAlert
        severity={severity}
        title={title}
        description={description as NonNullable<React.ReactNode>}
        className={className}
        closable={closable}
        onClose={onClose}
      />
    );
  }
  return (
    <DsfrAlert
      severity={severity}
      small
      description={(description ?? "") as NonNullable<React.ReactNode>}
      className={className}
      closable={closable}
      onClose={onClose}
    />
  );
};
