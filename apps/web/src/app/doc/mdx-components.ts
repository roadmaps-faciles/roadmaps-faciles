import defaultMdxComponents from "fumadocs-ui/mdx";
import { type MDXComponents } from "mdx/types";

import { ImageWithTheme } from "./ImageWithTheme";

export function getDocMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ImageWithTheme,
    ...components,
  };
}
