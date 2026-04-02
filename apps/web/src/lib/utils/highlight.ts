import "./highlight-dsfr.scss";

import hljs from "highlight.js";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("markdown", markdown);
hljs.configure({
  languages: ["markdown"],
  ignoreUnescapedHTML: true,
});

export { hljs };
