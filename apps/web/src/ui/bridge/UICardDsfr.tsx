"use client";

import { Card as DsfrCard, type CardProps as DsfrCardProps } from "@codegouvfr/react-dsfr/Card";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { type ReactNode, useSyncExternalStore } from "react";

import { type UICardProps } from "./UICard";

/** Detect dark mode from `.dark` class on `<html>` — works in both themes, no DSFR provider dependency. */
function subscribeIsDark(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
function getIsDarkSnapshot() {
  return document.documentElement.classList.contains("dark");
}
function getIsDarkServerSnapshot() {
  return false;
}
function useIsDarkDOM(): boolean {
  return useSyncExternalStore(subscribeIsDark, getIsDarkSnapshot, getIsDarkServerSnapshot);
}

function useShadow(shadow: UICardProps["shadow"]): DsfrCardProps["shadow"] {
  const isDark = useIsDarkDOM();
  if (shadow === true) return true;
  if (shadow === "dark") return isDark;
  if (shadow === "light") return !isDark;
  return false;
}

const SIZE_MAP = {
  sm: "small",
  default: "medium",
  lg: "large",
} as const;

export const UICardDsfr = ({
  title,
  titleAs: TitleTag = "h3",
  description,
  subtitle,
  footer,
  href,
  linkTarget,
  horizontal,
  size,
  shadow,
  className,
}: UICardProps) => {
  const resolvedShadow = useShadow(shadow);

  // DSFR Card renders `desc` in a <p> — block-level children (div, form, h2, hr) cause
  // invalid HTML nesting. When description is complex (not a string), render the card
  // structure manually using DSFR CSS classes with a <div> instead of <p> for the desc.
  const hasComplexDescription = description != null && typeof description !== "string";

  if (hasComplexDescription) {
    const shadowClass = resolvedShadow ? "fr-card--shadow" : "fr-card--no-shadow";
    const sizeClass = size ? `fr-card--${SIZE_MAP[size]}` : undefined;
    const horizontalClass = horizontal ? "fr-card--horizontal" : undefined;

    return (
      <div className={cx("fr-card", shadowClass, sizeClass, horizontalClass, className)}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            {href ? (
              <TitleTag className="fr-card__title">
                <a href={href} {...(linkTarget && { target: linkTarget })}>
                  {title}
                </a>
              </TitleTag>
            ) : (
              <TitleTag className="fr-card__title">{title}</TitleTag>
            )}
            {subtitle && <p className="fr-card__detail">{subtitle}</p>}
            <div className="fr-card__desc">{description}</div>
          </div>
          {footer && <div className="fr-card__end">{footer}</div>}
        </div>
      </div>
    );
  }

  const commonProps: DsfrCardProps = {
    title: title as NonNullable<ReactNode>,
    titleAs: TitleTag,
    desc: description,
    detail: subtitle,
    endDetail: footer,
    ...(href && { linkProps: { href, ...(linkTarget && { target: linkTarget }) } }),
    size: size ? SIZE_MAP[size] : undefined,
    shadow: resolvedShadow,
    className,
  };

  if (horizontal) {
    return <DsfrCard {...commonProps} horizontal />;
  }
  return <DsfrCard {...commonProps} />;
};
