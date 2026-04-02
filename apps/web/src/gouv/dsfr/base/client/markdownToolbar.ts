type WrapAction = {
  after: string;
  before: string;
  type: "wrap";
};

type PrefixAction = {
  prefix: string;
  type: "prefix";
};

type InsertAction = {
  text: string;
  type: "insert";
};

type ToolbarAction = InsertAction | PrefixAction | WrapAction;

export type ToolbarItem = {
  action: ToolbarAction;
  icon: string;
  label: string;
  shortcut?: { ctrl: boolean; key: string };
};

export const toolbarItems: ToolbarItem[] = [
  {
    label: "bold",
    icon: "fr-icon-bold",
    action: { type: "wrap", before: "**", after: "**" },
    shortcut: { ctrl: true, key: "b" },
  },
  {
    label: "italic",
    icon: "fr-icon-italic",
    action: { type: "wrap", before: "_", after: "_" },
    shortcut: { ctrl: true, key: "i" },
  },
  {
    label: "heading",
    icon: "fr-icon-h-1",
    action: { type: "prefix", prefix: "## " },
  },
  {
    label: "list",
    icon: "fr-icon-list-unordered",
    action: { type: "prefix", prefix: "- " },
  },
  {
    label: "orderedList",
    icon: "fr-icon-list-ordered",
    action: { type: "prefix", prefix: "1. " },
  },
  {
    label: "quote",
    icon: "fr-icon-quote-line",
    action: { type: "prefix", prefix: "> " },
  },
  {
    label: "code",
    icon: "fr-icon-code-s-slash-line",
    action: { type: "wrap", before: "`", after: "`" },
  },
  {
    label: "link",
    icon: "fr-icon-link",
    action: { type: "wrap", before: "[", after: "](url)" },
  },
];

export function applyToolbarAction(
  textarea: HTMLTextAreaElement,
  action: ToolbarAction,
): { cursorEnd: number; cursorStart: number; newValue: string } {
  const { selectionStart, selectionEnd, value } = textarea;
  const selectedText = value.substring(selectionStart, selectionEnd);

  switch (action.type) {
    case "wrap": {
      const newText = `${action.before}${selectedText || "texte"}${action.after}`;
      const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
      const cursorStart = selectionStart + action.before.length;
      const cursorEnd = selectedText
        ? selectionStart + action.before.length + selectedText.length
        : selectionStart + newText.length - action.after.length;
      return { newValue, cursorStart, cursorEnd };
    }
    case "prefix": {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const newValue = value.substring(0, lineStart) + action.prefix + value.substring(lineStart);
      const cursorStart = selectionStart + action.prefix.length;
      const cursorEnd = selectionEnd + action.prefix.length;
      return { newValue, cursorStart, cursorEnd };
    }
    case "insert": {
      const newValue = value.substring(0, selectionStart) + action.text + value.substring(selectionEnd);
      const cursorPos = selectionStart + action.text.length;
      return { newValue, cursorStart: cursorPos, cursorEnd: cursorPos };
    }
  }
}

export function insertImageMarkdown(
  textarea: HTMLTextAreaElement,
  url: string,
  alt = "image",
): { cursorEnd: number; cursorStart: number; newValue: string } {
  return applyToolbarAction(textarea, {
    type: "insert",
    text: `![${alt}](${url})`,
  });
}
