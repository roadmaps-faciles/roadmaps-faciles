"use client";

import DsfrInput from "@codegouvfr/react-dsfr/Input";
import { useId } from "react";

import { type UIInputProps } from "./UIInput";

export const UIInputDsfr = ({
  label,
  hintText,
  nativeInputProps,
  state = "default",
  stateRelatedMessage,
  className,
  disabled,
  textArea,
}: UIInputProps) => {
  const fallbackId = useId();
  const inputId = nativeInputProps?.id ?? fallbackId;

  const commonProps = {
    label,
    hintText,
    state,
    stateRelatedMessage,
    className,
    disabled,
  } as const;

  if (textArea) {
    return (
      <DsfrInput
        {...commonProps}
        textArea
        nativeTextAreaProps={{
          ...(nativeInputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>),
          id: inputId,
        }}
      />
    );
  }
  return <DsfrInput {...commonProps} nativeInputProps={{ ...nativeInputProps, id: inputId }} />;
};
