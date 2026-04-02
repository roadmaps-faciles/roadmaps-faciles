"use client";

import { search } from "node-emoji";
import { type DragEvent, type KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from "react";

import { applyToolbarAction, insertImageMarkdown, toolbarItems } from "./markdownToolbar";

const ALLOWED_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"]);

interface UseMarkdownEditorOptions {
  defaultValue?: string;
  disabled?: boolean;
  emojiCharClassName?: string;
  emojiMenuClassName?: string;
  emojiNameClassName?: string;
  onChangeAction?: (value: string) => void;
  t: (key: string) => string;
  uploadImageAction?: (formData: FormData) => Promise<{ data?: { url: string }; error?: string; ok: boolean }>;
}

export function useMarkdownEditor({
  defaultValue = "",
  disabled = false,
  emojiMenuClassName,
  emojiCharClassName,
  emojiNameClassName,
  onChangeAction,
  t,
  uploadImageAction,
}: UseMarkdownEditorOptions) {
  const [value, setValue] = useState(defaultValue);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<null | string>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expanderEl, setExpanderEl] = useState<HTMLElement | null>(null);
  const expanderCallbackRef = useCallback((node: HTMLElement | null) => setExpanderEl(node), []);
  const inputId = useId();

  // Load text-expander Web Component client-side only (uses HTMLElement at module scope)
  useEffect(() => {
    void import("@github/text-expander-element");
  }, []);

  useEffect(() => {
    if (!uploadError) return;
    const timer = setTimeout(() => setUploadError(null), 5000);
    return () => clearTimeout(timer);
  }, [uploadError]);

  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onChangeAction?.(newValue);
    },
    [onChangeAction],
  );

  // Emoji autocomplete via text-expander
  useEffect(() => {
    if (!expanderEl) return;
    const expander = expanderEl;

    const MAX_SUGGESTIONS = 8;

    const handleChange = (e: Event) => {
      const { text, provide } = (e as CustomEvent).detail as {
        provide: (result: { fragment?: HTMLElement; matched: boolean }) => void;
        text: string;
      };

      let results: ReturnType<typeof search> = [];
      try {
        results = search(text).slice(0, MAX_SUGGESTIONS);
      } catch {
        // node-emoji passes query to RegExp — special chars like +, *, ( crash it
        provide({ matched: false });
        return;
      }
      if (results.length === 0) {
        provide({ matched: false });
        return;
      }

      const menu = document.createElement("ul");
      if (emojiMenuClassName) menu.className = emojiMenuClassName;
      menu.setAttribute("role", "listbox");

      for (const result of results) {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("data-value", `:${result.name}:`);
        const charSpan = document.createElement("span");
        if (emojiCharClassName) charSpan.className = emojiCharClassName;
        charSpan.textContent = result.emoji;
        const nameSpan = document.createElement("span");
        if (emojiNameClassName) nameSpan.className = emojiNameClassName;
        nameSpan.textContent = `:${result.name}:`;
        li.append(charSpan, " ", nameSpan);
        menu.appendChild(li);
      }

      provide({ matched: true, fragment: menu });
    };

    const handleValue = (e: Event) => {
      const detail = (e as CustomEvent).detail as { item: HTMLElement; value: null | string };
      detail.value = detail.item.getAttribute("data-value");
    };

    const handleCommitted = (e: Event) => {
      const detail = (e as CustomEvent).detail as { input: HTMLTextAreaElement };
      updateValue(detail.input.value);
    };

    expander.addEventListener("text-expander-change", handleChange);
    expander.addEventListener("text-expander-value", handleValue);
    expander.addEventListener("text-expander-committed", handleCommitted);

    return () => {
      expander.removeEventListener("text-expander-change", handleChange);
      expander.removeEventListener("text-expander-value", handleValue);
      expander.removeEventListener("text-expander-committed", handleCommitted);
    };
  }, [expanderEl, emojiMenuClassName, emojiCharClassName, emojiNameClassName, updateValue]);

  const applyAction = useCallback(
    (action: (typeof toolbarItems)[number]["action"]) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { newValue, cursorStart, cursorEnd } = applyToolbarAction(textarea, action);
      updateValue(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [updateValue],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!uploadImageAction) return;
      if (!ALLOWED_TYPES.has(file.type)) return;

      setUploading(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadImageAction(formData);

        if (result.ok && result.data) {
          const textarea = textareaRef.current;
          if (!textarea) return;

          const { newValue, cursorStart, cursorEnd } = insertImageMarkdown(
            textarea,
            result.data.url,
            file.name.replace(/\.[^.]+$/, ""),
          );
          updateValue(newValue);

          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorStart, cursorEnd);
          });
        } else if (result.error) {
          setUploadError(result.error);
        }
      } catch {
        setUploadError(t("uploadFailed"));
      } finally {
        setUploading(false);
      }
    },
    [t, uploadImageAction, updateValue],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const item = toolbarItems.find(i => i.shortcut?.key === e.key.toLowerCase());
      if (item) {
        e.preventDefault();
        applyAction(item.action);
      }
    },
    [applyAction],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      const items = e.clipboardData.items;
      for (const item of items) {
        if (ALLOWED_TYPES.has(item.type)) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) void handleUpload(file);
          return;
        }
      }
    },
    [disabled, handleUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (ALLOWED_TYPES.has(file.type)) {
          void handleUpload(file);
        }
      }
    },
    [disabled, handleUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const triggerFileUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/gif,image/webp";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void handleUpload(file);
    };
    input.click();
  }, [handleUpload]);

  // Pre-build JSX props so consumers don't access refs during render
  const textareaProps = {
    ref: textareaRef,
    id: inputId,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => updateValue(e.target.value),
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
  };

  return {
    value,
    previewEnabled,
    setPreviewEnabled,
    uploading,
    isDragging,
    uploadError,
    inputId,
    updateValue,
    applyAction,
    triggerFileUpload,
    expanderCallbackRef,
    textareaProps,
    uploadImageAction,
  };
}
