"use client";

import { cn, Label, Switch } from "@roadmaps-faciles/ui";
import { Bold, Code, Heading2, ImageIcon, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { MarkdownHooks } from "react-markdown";

import { toolbarItems } from "@/gouv/dsfr/base/client/markdownToolbar";
import { useMarkdownEditor } from "@/gouv/dsfr/base/client/useMarkdownEditor";
import { reactMarkdownPreviewConfig } from "@/utils/react-markdown";

import styles from "../../gouv/dsfr/base/client/MarkdownEditor.module.scss";
import { type UIMarkdownEditorProps } from "./UIMarkdownEditor";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "text-expander": React.DetailedHTMLProps<{ keys?: string } & React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

/** Lucide icon map — matches the order of toolbarItems in markdownToolbar.ts */
const TOOLBAR_ICONS: Record<string, ReactNode> = {
  "fr-icon-bold": <Bold className="size-4" />,
  "fr-icon-italic": <Italic className="size-4" />,
  "fr-icon-h-1": <Heading2 className="size-4" />,
  "fr-icon-list-unordered": <List className="size-4" />,
  "fr-icon-list-ordered": <ListOrdered className="size-4" />,
  "fr-icon-quote-line": <Quote className="size-4" />,
  "fr-icon-code-s-slash-line": <Code className="size-4" />,
  "fr-icon-link": <Link2 className="size-4" />,
};

export const UIMarkdownEditorDefault = ({
  label,
  hintText,
  defaultValue = "",
  disabled = false,
  onChangeAction,
  uploadImageAction,
}: UIMarkdownEditorProps) => {
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
        <div className="mb-1.5">
          <Label htmlFor={inputId}>
            {label}
            {hintText !== undefined && <span className="text-sm text-muted-foreground ml-1">{hintText}</span>}
          </Label>
        </div>
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
                {TOOLBAR_ICONS[item.icon] ?? <span className="size-4" />}
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
                <ImageIcon className="size-4" />
              </button>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {uploading && <span className={styles.uploading}>{t("uploading")}</span>}
            {uploadError && <span className={styles.uploadError}>{uploadError}</span>}
            <Label htmlFor={`${inputId}-preview`} className="text-sm cursor-pointer">
              {t("preview")}
            </Label>
            <Switch
              id={`${inputId}-preview`}
              checked={previewEnabled}
              onCheckedChange={checked => setPreviewEnabled(checked)}
            />
          </div>
        </div>

        {previewEnabled ? (
          <div className={styles.preview}>
            {value ? (
              <MarkdownHooks {...reactMarkdownPreviewConfig}>{value}</MarkdownHooks>
            ) : (
              <span className="text-sm text-muted-foreground">{t("previewEmpty")}</span>
            )}
          </div>
        ) : (
          <text-expander ref={expanderCallbackRef} keys=":">
            <textarea
              {...textareaProps}
              className={cn(styles.textarea, isDragging && styles.dropzone)}
              value={value}
              placeholder={t("placeholder")}
            />
          </text-expander>
        )}
      </div>
    </div>
  );
};
