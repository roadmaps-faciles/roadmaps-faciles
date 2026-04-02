"use client";

import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

import { UIMarkdownEditorDefault } from "./UIMarkdownEditorDefault";

const MarkdownEditorDsfr = lazy(() =>
  import("@/gouv/dsfr/base/client/MarkdownEditor").then(m => ({ default: m.MarkdownEditor })),
);

export interface UIMarkdownEditorProps {
  defaultValue?: string;
  disabled?: boolean;
  hintText?: string;
  label?: string;
  onChangeAction?: (value: string) => void;
  uploadImageAction?: (formData: FormData) => Promise<{ data?: { url: string }; error?: string; ok: boolean }>;
}

export const UIMarkdownEditor = (props: UIMarkdownEditorProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <MarkdownEditorDsfr {...props} />
      </Suspense>
    );
  }

  return <UIMarkdownEditorDefault {...props} />;
};
