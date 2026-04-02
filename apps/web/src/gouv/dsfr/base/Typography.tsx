import { fr } from "@codegouvfr/react-dsfr";
import { cx, type CxArg } from "@codegouvfr/react-dsfr/tools/cx";
import { type ForwardedRef, forwardRef, type PropsWithChildren } from "react";

import { type PropsWithoutChildren } from "@/utils/types";

import { buildSpacingClasses, type SpacingProps } from "../utils/spacing";

type TypoVariant = (typeof fr.typography)[number]["selector"];
export type TypographyProps = PropsWithChildren<
  {
    className?: CxArg;
  } & SpacingProps
>;

const typographyProps = <P extends PropsWithoutChildren<TypographyProps>>({
  className,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  ...rest
}: P) => ({
  className: cx(fr.cx(buildSpacingClasses({ mt, mr, mb, ml, mx, my, pt, pr, pb, pl, px, py })), className),
  ...rest,
});

type HeadingVariant = `h${1 | 2 | 3 | 4 | 5 | 6}`;
type HeadingDisplay = "lg" | "md" | "sm" | "xl" | "xs";
type HeadingAttributes = PropsWithoutChildren<React.HTMLAttributes<HTMLHeadingElement>>;
export type HeadingProps = (
  | {
      /**
       * Remove `variant` to use `display`
       * @deprecated
       */
      display?: never;
      /** Should the tag looks like another? */
      variant?: HeadingVariant;
    }
  | {
      /** How should the tag be displayed? */
      display?: HeadingDisplay;
      /**
       * Remove `display` to use `variant`
       * @deprecated
       */
      variant?: never;
    }
) &
  ({
    /** The html tag */
    as: HeadingVariant;
  } & HeadingAttributes &
    TypographyProps);

const headingProps = ({ display, variant, ...rest }: Omit<HeadingProps, "as" | "text">) => {
  const tagProps = typographyProps(rest);
  tagProps.className = cx(tagProps.className, fr.cx(display && `fr-display--${display}`, variant && `fr-${variant}`));

  return tagProps;
};

/**
 * `as` H1 => H6.
 *
 * If `variant` is provided, the element will be displayed as `as` but will
 * have the style of `variant`.
 *
 * If `display` is provided, the element will be displayed as `as` but will
 * have a dedicated style base on `display`.
 *
 * Either `variant` or `display` should be provided, not both.
 *
 * @see https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-de-l-identite-de-l-etat/typographie/#:~:text=Titres%20et%20titres%20alternatifs
 */
export const Heading = ({ as: HtmlTag, children, ...rest }: HeadingProps) => {
  const tagProps = headingProps(rest);

  return <HtmlTag {...tagProps}>{children}</HtmlTag>;
};

/**
 * Ref version of {@link Heading}
 */
export const HeadingRef = forwardRef<HTMLHeadingElement, HeadingProps>(({ as: HtmlTag, children, ...rest }, ref) => {
  const tagProps = headingProps(rest);

  return (
    <HtmlTag {...tagProps} ref={ref}>
      {children}
    </HtmlTag>
  );
});
HeadingRef.displayName = "HeadingRef";

type TextVariant = TypoVariant extends infer R ? (R extends `.fr-text--${infer T}` ? T : never) : never;
type TextAttributes<Inline extends boolean> = Inline extends true
  ? React.HTMLAttributes<HTMLSpanElement>
  : React.HTMLAttributes<HTMLParagraphElement>;
export type TextProps<Inline extends boolean> = {
  inline?: Inline;
  variant?: TextVariant | TextVariant[];
} & TextAttributes<Inline> &
  TypographyProps;

const textProps = ({ variant, ...rest }: Omit<TextProps<boolean>, "inline" | "text">) => {
  const tagProps = typographyProps(rest);
  tagProps.className = cx(tagProps.className, cx(variant && [variant].flat().map(v => `fr-text--${v}`)));

  return tagProps;
};

/**
 * @see https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-de-l-identite-de-l-etat/typographie/#:~:text=Corps%20de%20texte
 */
export const Text = <Inline extends boolean>({ inline, children, ...rest }: TextProps<Inline>) =>
  inline ? <span {...textProps(rest)}>{children}</span> : <p {...textProps(rest)}>{children}</p>;

/**
 * Ref version of {@link Text}
 */
export const TextRef = forwardRef<HTMLParagraphElement | HTMLSpanElement, TextProps<boolean>>(
  ({ children, inline, ...rest }, ref) =>
    inline === true ? (
      <span {...textProps(rest)} ref={ref}>
        {children}
      </span>
    ) : (
      <p {...textProps(rest)} ref={ref as ForwardedRef<HTMLParagraphElement>}>
        {children}
      </p>
    ),
);
TextRef.displayName = "TextRef";
