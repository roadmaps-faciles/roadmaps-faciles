"use client";

import { fr } from "@codegouvfr/react-dsfr";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { MarkdownHooks } from "react-markdown";

import { reactMarkdownPreviewConfig } from "@/utils/react-markdown";

import { Text } from "../Typography";
import styles from "./MarkdownEditor.module.scss";
import { toolbarItems } from "./markdownToolbar";
import { useMarkdownEditor } from "./useMarkdownEditor";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "text-expander": React.DetailedHTMLProps<{ keys?: string } & React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export interface MarkdownEditorProps {
  defaultValue?: string;
  disabled?: boolean;
  hintText?: string;
  label?: string;
  onChangeAction?: (value: string) => void;
  uploadImageAction?: (formData: FormData) => Promise<{ data?: { url: string }; error?: string; ok: boolean }>;
}

export const MarkdownEditor = ({
  label,
  hintText,
  defaultValue = "",
  disabled = false,
  onChangeAction,
  uploadImageAction,
}: MarkdownEditorProps) => {
  const t = useTranslations("editor");

  const {
    value,
    previewEnabled,
    setPreviewEnabled,
    uploading,
    isDragging,
    uploadError,
    inputId,
    applyAction,
    triggerFileUpload,
    expanderCallbackRef,
    textareaProps,
  } = useMarkdownEditor({
    defaultValue,
    disabled,
    emojiMenuClassName: styles.emojiMenu,
    emojiCharClassName: styles.emojiChar,
    emojiNameClassName: styles.emojiName,
    onChangeAction,
    t: key => t(key as Parameters<typeof t>[0]),
    uploadImageAction,
  });

  return (
    <div>
      {Boolean(label) && (
        <label className={fr.cx("fr-label")} htmlFor={inputId}>
          {label}
          {hintText !== undefined && <span className="fr-hint-text">{hintText}</span>}
        </label>
      )}
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          {toolbarItems.map((item, index) => (
            <Fragment key={item.label}>
              {(index === 2 || index === 5) && <span className={styles.separator} />}
              <button
                type="button"
                className={styles.toolbarButton}
                title={t(item.label as Parameters<typeof t>[0])}
                disabled={disabled || previewEnabled}
                onClick={() => applyAction(item.action)}
              >
                <span className={cx(fr.cx(item.icon as Parameters<typeof fr.cx>[0]), "fr-icon--sm")} aria-hidden />
              </button>
            </Fragment>
          ))}

          {uploadImageAction && (
            <>
              <span className={styles.separator} />
              <button
                type="button"
                className={styles.toolbarButton}
                title={t("image")}
                disabled={disabled || previewEnabled || uploading}
                onClick={triggerFileUpload}
              >
                <span className={cx(fr.cx("fr-icon-image-line"), "fr-icon--sm")} aria-hidden />
              </button>
            </>
          )}

          <div className="ml-auto flex items-center">
            {uploading && <span className={styles.uploading}>{t("uploading")}</span>}
            {uploadError && <span className={styles.uploadError}>{uploadError}</span>}
            <ToggleSwitch
              className="mb-0"
              label={
                <Text inline variant="sm" className="mr-[-1.5rem]">
                  {t("preview")}
                </Text>
              }
              inputTitle={t("preview")}
              labelPosition="left"
              checked={previewEnabled}
              onChange={() => setPreviewEnabled(!previewEnabled)}
            />
          </div>
        </div>

        {previewEnabled ? (
          <div className={styles.preview}>
            {value ? (
              <MarkdownHooks {...reactMarkdownPreviewConfig}>{value}</MarkdownHooks>
            ) : (
              <Text className={fr.cx("fr-text--light")}>{t("previewEmpty")}</Text>
            )}
          </div>
        ) : (
          <text-expander ref={expanderCallbackRef} keys=":">
            <textarea
              {...textareaProps}
              className={cx(styles.textarea, isDragging && styles.dropzone)}
              value={value}
              placeholder={t("placeholder")}
            />
          </text-expander>
        )}
      </div>
    </div>
  );
};
