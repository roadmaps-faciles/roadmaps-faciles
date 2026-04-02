"use client";

import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
} from "@roadmaps-faciles/ui";
import Link from "next/link";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UICardDsfr = lazy(() => import("./UICardDsfr").then(m => ({ default: m.UICardDsfr })));

export type UICardProps = {
  className?: string;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  horizontal?: boolean;
  href?: string;
  linkTarget?: string;
  /** Shadow mode — true=always, "light"=light only, "dark"=dark only, omit=never */
  shadow?: "dark" | "light" | true;
  /** Size — "sm" maps to DSFR `size="small"`, "lg" maps to `size="large"` */
  size?: "default" | "lg" | "sm";
  subtitle?: React.ReactNode;
  title: React.ReactNode;
  titleAs?: "h2" | "h3" | "h4" | "h5" | "h6";
};

export const UICard = ({
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
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UICardDsfr
          title={title}
          titleAs={TitleTag}
          description={description}
          subtitle={subtitle}
          footer={footer}
          href={href}
          linkTarget={linkTarget}
          horizontal={horizontal}
          size={size}
          shadow={shadow}
          className={className}
        />
      </Suspense>
    );
  }

  const isSmall = size === "sm";
  const shadowClass =
    shadow === true
      ? "shadow-md"
      : shadow === "dark"
        ? "dark:shadow-md"
        : shadow === "light"
          ? "shadow-md dark:shadow-none"
          : undefined;

  const cardContent = (
    <ShadcnCard className={cn(shadowClass, isSmall && "p-3", className)}>
      <CardHeader className={cn(isSmall && "p-0 pb-1")}>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
        <CardTitle className={cn(isSmall && "text-sm font-medium")}>
          <TitleTag className="m-0">{title}</TitleTag>
        </CardTitle>
      </CardHeader>
      {description && <CardContent className={cn(isSmall && "p-0 pt-1")}>{description}</CardContent>}
      {footer && <CardFooter className={cn(isSmall && "p-0 pt-1")}>{footer}</CardFooter>}
    </ShadcnCard>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline" {...(linkTarget && { target: linkTarget })}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};
