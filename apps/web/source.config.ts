import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
});

// --- Remark plugin: replaces {{variableName}} placeholders in MDX content ---

interface MdastNode {
  children?: MdastNode[];
  url?: string;
  value?: string;
}

const mdxVariables: Record<string, string> = {
  rootDomain: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").host.replace(/^www\./, ""),
};

function replaceVars(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => mdxVariables[key] ?? match);
}

function walkMdast(node: MdastNode) {
  if (typeof node.value === "string") {
    node.value = replaceVars(node.value);
  }
  if (typeof node.url === "string") {
    node.url = replaceVars(node.url);
  }
  if (Array.isArray(node.children)) {
    node.children.forEach(walkMdast);
  }
}

function remarkVariables() {
  return (tree: MdastNode) => walkMdast(tree);
}

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkVariables],
  },
});
