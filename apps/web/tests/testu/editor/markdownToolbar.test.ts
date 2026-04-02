import { applyToolbarAction, insertImageMarkdown } from "../../../src/gouv/dsfr/base/client/markdownToolbar";

/**
 * Helper to create a fake textarea-like object for testing.
 * Only the properties read by applyToolbarAction are needed.
 */
function fakeTextarea(value: string, selectionStart: number, selectionEnd?: number) {
  return { value, selectionStart, selectionEnd: selectionEnd ?? selectionStart } as HTMLTextAreaElement;
}

describe("applyToolbarAction", () => {
  describe("wrap", () => {
    const boldAction = { type: "wrap" as const, before: "**", after: "**" };
    const linkAction = { type: "wrap" as const, before: "[", after: "](url)" };

    it("wraps selected text with before/after", () => {
      const textarea = fakeTextarea("hello world", 6, 11);
      const result = applyToolbarAction(textarea, boldAction);

      expect(result.newValue).toBe("hello **world**");
      expect(result.cursorStart).toBe(8); // after **
      expect(result.cursorEnd).toBe(13); // after "world"
    });

    it("inserts placeholder 'texte' when no selection", () => {
      const textarea = fakeTextarea("hello ", 6);
      const result = applyToolbarAction(textarea, boldAction);

      expect(result.newValue).toBe("hello **texte**");
      expect(result.cursorStart).toBe(8); // after **
      expect(result.cursorEnd).toBe(13); // after "texte", before **
    });

    it("places cursor correctly with asymmetric wrap (link)", () => {
      const textarea = fakeTextarea("click here", 6, 10);
      const result = applyToolbarAction(textarea, linkAction);

      expect(result.newValue).toBe("click [here](url)");
      expect(result.cursorStart).toBe(7); // after [
      expect(result.cursorEnd).toBe(11); // after "here"
    });

    it("wraps at the beginning of text", () => {
      const textarea = fakeTextarea("hello", 0, 5);
      const result = applyToolbarAction(textarea, boldAction);

      expect(result.newValue).toBe("**hello**");
      expect(result.cursorStart).toBe(2);
      expect(result.cursorEnd).toBe(7);
    });

    it("inserts placeholder in empty text", () => {
      const textarea = fakeTextarea("", 0);
      const result = applyToolbarAction(textarea, boldAction);

      expect(result.newValue).toBe("**texte**");
      expect(result.cursorStart).toBe(2);
      expect(result.cursorEnd).toBe(7);
    });

    it("wraps with code backtick", () => {
      const textarea = fakeTextarea("use const", 4, 9);
      const result = applyToolbarAction(textarea, { type: "wrap", before: "`", after: "`" });

      expect(result.newValue).toBe("use `const`");
      expect(result.cursorStart).toBe(5);
      expect(result.cursorEnd).toBe(10);
    });
  });

  describe("prefix", () => {
    const headingAction = { type: "prefix" as const, prefix: "## " };
    const listAction = { type: "prefix" as const, prefix: "- " };

    it("inserts prefix at the beginning of the current line", () => {
      const textarea = fakeTextarea("hello world", 6);
      const result = applyToolbarAction(textarea, headingAction);

      expect(result.newValue).toBe("## hello world");
      expect(result.cursorStart).toBe(9); // original 6 + 3 ("## ")
      expect(result.cursorEnd).toBe(9);
    });

    it("inserts prefix at document start (position 0)", () => {
      const textarea = fakeTextarea("title", 0);
      const result = applyToolbarAction(textarea, headingAction);

      expect(result.newValue).toBe("## title");
      expect(result.cursorStart).toBe(3);
      expect(result.cursorEnd).toBe(3);
    });

    it("finds line start after newline", () => {
      const textarea = fakeTextarea("line1\nline2", 8);
      const result = applyToolbarAction(textarea, listAction);

      expect(result.newValue).toBe("line1\n- line2");
      expect(result.cursorStart).toBe(10); // original 8 + 2 ("- ")
      expect(result.cursorEnd).toBe(10);
    });

    it("handles cursor at line start after newline", () => {
      const textarea = fakeTextarea("line1\nline2", 6);
      const result = applyToolbarAction(textarea, listAction);

      expect(result.newValue).toBe("line1\n- line2");
      expect(result.cursorStart).toBe(8);
      expect(result.cursorEnd).toBe(8);
    });

    it("preserves selection range with prefix offset", () => {
      const textarea = fakeTextarea("item one", 0, 8);
      const result = applyToolbarAction(textarea, listAction);

      expect(result.newValue).toBe("- item one");
      expect(result.cursorStart).toBe(2);
      expect(result.cursorEnd).toBe(10);
    });
  });

  describe("insert", () => {
    it("inserts text at cursor position", () => {
      const textarea = fakeTextarea("hello world", 5);
      const result = applyToolbarAction(textarea, { type: "insert", text: " beautiful" });

      expect(result.newValue).toBe("hello beautiful world");
      expect(result.cursorStart).toBe(15);
      expect(result.cursorEnd).toBe(15);
    });

    it("inserts text at the end", () => {
      const textarea = fakeTextarea("hello", 5);
      const result = applyToolbarAction(textarea, { type: "insert", text: " world" });

      expect(result.newValue).toBe("hello world");
      expect(result.cursorStart).toBe(11);
      expect(result.cursorEnd).toBe(11);
    });

    it("replaces selected text", () => {
      const textarea = fakeTextarea("hello world", 6, 11);
      const result = applyToolbarAction(textarea, { type: "insert", text: "there" });

      expect(result.newValue).toBe("hello there");
      expect(result.cursorStart).toBe(11);
      expect(result.cursorEnd).toBe(11);
    });

    it("inserts into empty text", () => {
      const textarea = fakeTextarea("", 0);
      const result = applyToolbarAction(textarea, { type: "insert", text: "new content" });

      expect(result.newValue).toBe("new content");
      expect(result.cursorStart).toBe(11);
      expect(result.cursorEnd).toBe(11);
    });
  });
});

describe("insertImageMarkdown", () => {
  it("inserts image markdown with default alt", () => {
    const textarea = fakeTextarea("text ", 5);
    const result = insertImageMarkdown(textarea, "https://example.com/img.png");

    expect(result.newValue).toBe("text ![image](https://example.com/img.png)");
    expect(result.cursorStart).toBe(42);
    expect(result.cursorEnd).toBe(42);
  });

  it("inserts image markdown with custom alt", () => {
    const textarea = fakeTextarea("", 0);
    const result = insertImageMarkdown(textarea, "/api/uploads/tenants/1/images/abc.png", "screenshot");

    expect(result.newValue).toBe("![screenshot](/api/uploads/tenants/1/images/abc.png)");
    expect(result.cursorStart).toBe(52);
    expect(result.cursorEnd).toBe(52);
  });

  it("inserts at cursor position in existing text", () => {
    const textarea = fakeTextarea("before  after", 7);
    const result = insertImageMarkdown(textarea, "/img.png");

    expect(result.newValue).toBe("before ![image](/img.png) after");
    expect(result.cursorStart).toBe(25);
    expect(result.cursorEnd).toBe(25);
  });
});
