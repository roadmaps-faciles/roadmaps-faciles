import { type Options } from "react-markdown";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

const remarkEmojiOptions = { emoticon: true };

export const reactMarkdownConfig: Options = {
  remarkPlugins: [remarkGfm, remarkDirective, remarkDirectiveRehype, [remarkEmoji, remarkEmojiOptions]],
  unwrapDisallowed: true,
  disallowedElements: ["p"],
  allowElement: elt => elt.tagName !== "p",
  components: {
    ["search-mark" as "div"]: ({ children }) => {
      return <mark>{children}</mark>;
    },
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className="max-w-full h-auto rounded" />
    ),
  },
};

export const reactMarkdownPreviewConfig: Options = {
  remarkPlugins: [remarkGfm, remarkDirective, remarkDirectiveRehype, [remarkEmoji, remarkEmojiOptions]],
  components: reactMarkdownConfig.components,
};
