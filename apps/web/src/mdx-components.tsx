import { type MDXComponents } from "mdx/types";
import { Fragment, type PropsWithChildren } from "react";

import { getLabelFromChildren } from "@/utils/react";
import { slugify } from "@/utils/string";

import { AnchorLink } from "./gouv/dsfr/client";

export const anchorHeadingMDXComponents: MDXComponents = {
  h1: (props: PropsWithChildren) => (
    <AnchorLink as="h1" anchor={slugify(getLabelFromChildren(props.children))} {...props} />
  ),
  h2: (props: PropsWithChildren) => (
    <AnchorLink as="h2" anchor={slugify(getLabelFromChildren(props.children))} {...props} />
  ),
  h3: (props: PropsWithChildren) => (
    <AnchorLink as="h3" anchor={slugify(getLabelFromChildren(props.children))} {...props} />
  ),
};

/**
 * Avoid unauthorized HTML tags inside p tags. (e.g. no p inside p, no div inside p, etc.)
 */
export const paragraphContentMDXComponents: MDXComponents = {
  // Fragment strips <p> wrapper to avoid invalid nesting (p > p, p > div)
  // @ts-expect-error -- Fragment is incompatible with MDX's p type after @types/react bump
  p: Fragment,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...anchorHeadingMDXComponents,
    ...components,
  };
}
