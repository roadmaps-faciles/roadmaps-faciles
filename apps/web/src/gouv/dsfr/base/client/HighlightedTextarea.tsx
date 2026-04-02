"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { type InputProps } from "@codegouvfr/react-dsfr/Input";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { type DetailedHTMLProps, type LabelHTMLAttributes, useId, useRef, useState } from "react";

import { hljs } from "@/utils/highlight";

import { Text } from "../Typography";
import styles from "./HighlightedTextarea.module.scss";

export type HighlightedTextareaProps = {
  hightlighted?: boolean;
  nativeLabelProps?: DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  previewButton?: boolean;
} & Omit<InputProps.TextArea, "nativeInputProps" | "nativeLabelProps" | "textArea">;

export const HighlightedTextarea = ({
  className,
  id,
  label,
  hintText,
  hideLabel,
  disabled = false,
  iconId,
  classes = {},
  style,
  state = "default",
  stateRelatedMessage,
  nativeTextAreaProps = {},
  addon,
  action,
  nativeLabelProps = {},
  previewButton,
  hightlighted,
  ...rest
}: HighlightedTextareaProps) => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleHighlight = () => {
    if (hightlighted && highlightRef.current && textareaRef.current) {
      window.requestAnimationFrame(() => {
        const content = hljs.highlight(textareaRef.current!.value, { language: "markdown" }).value;
        highlightRef.current!.innerHTML = content;
      });
    }
  };

  const inputId = (function useClosure() {
    const id = useId();

    return nativeTextAreaProps.id ?? `input-${id}`;
  })();

  const messageId = `${inputId}-desc-error`;
  const messagesGroupId = `${inputId}-messages-group`;

  return (
    <div
      className={cx(
        fr.cx(
          disabled && "fr-input-group--disabled",
          (() => {
            switch (state) {
              case "error":
                return "fr-input-group--error";
              case "success":
                return "fr-input-group--valid";
              case "default":
                return undefined;
            }
          })(),
        ),
        classes.root,
        className,
      )}
      style={style}
      id={id}
      {...rest}
    >
      {previewButton && (
        <ToggleSwitch
          disabled
          className="float-right mb-[.8rem]"
          label={
            <Text inline variant="sm" className="mr-[-1.5rem]">
              Aperçu
            </Text>
          }
          inputTitle="Aperçu"
          labelPosition="left"
          onChange={() => setPreviewEnabled(!previewEnabled)}
          defaultChecked={previewEnabled}
        />
      )}
      {Boolean(label || hintText) && (
        <label
          className={cx(fr.cx("fr-label", hideLabel && "fr-sr-only"), classes.label)}
          htmlFor={inputId}
          {...nativeLabelProps}
        >
          {label}
          {hintText !== undefined && <span className="fr-hint-text">{hintText}</span>}
        </label>
      )}

      {(() => {
        const nativeTextArea = (
          <div className="relative">
            <textarea
              {...nativeTextAreaProps}
              onInput={
                hightlighted
                  ? e => {
                      handleHighlight();
                      nativeTextAreaProps.onInput?.(e);
                    }
                  : nativeTextAreaProps.onInput
              }
              ref={textareaRef}
              className={cx(
                hightlighted && styles.textarea,
                fr.cx(
                  "fr-input",
                  (() => {
                    switch (state) {
                      case "error":
                        return "fr-input--error";
                      case "success":
                        return "fr-input--valid";
                      case "info":
                      case "default":
                        return undefined;
                    }
                  })(),
                ),
                classes.nativeInputOrTextArea,
              )}
              disabled={disabled || undefined}
              aria-describedby={
                [state !== "default" ? messageId : undefined, nativeTextAreaProps["aria-describedby"]]
                  .filter(value => value !== undefined)
                  .join(" ") || undefined
              }
              id={inputId}
            />
            {hightlighted && <div ref={highlightRef} className={cx(styles.highlighted, "hljs")}></div>}
          </div>
        );

        const hasIcon = iconId !== undefined;
        const hasAddon = addon !== undefined;
        const hasAction = action !== undefined;
        return hasIcon || hasAddon || hasAction ? (
          <div
            className={cx(
              fr.cx(
                "fr-input-wrap",
                hasIcon && iconId,
                hasAddon && "fr-input-wrap--addon",
                hasAction && "fr-input-wrap--action",
              ),
              classes.wrap,
            )}
          >
            {nativeTextArea}
            {hasAddon && addon}
            {hasAction && action}
          </div>
        ) : (
          nativeTextArea
        );
      })()}
      <div id={messagesGroupId} className={fr.cx("fr-messages-group")} aria-live="polite">
        {state !== "default" && (
          <p
            id={messageId}
            className={cx(
              fr.cx(
                (() => {
                  switch (state) {
                    case "error":
                      return "fr-error-text";
                    case "success":
                      return "fr-valid-text";
                    case "info":
                      return "fr-info-text";
                  }
                })(),
              ),
              classes.message,
            )}
          >
            {stateRelatedMessage}
          </p>
        )}
      </div>
    </div>
  );
};
