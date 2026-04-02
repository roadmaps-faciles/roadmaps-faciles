"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { type PropsWithChildren } from "react";

interface LikeButtonDsfrProps {
  liked: boolean;
  onClickAction: () => void;
  size?: "default" | "sm";
}

const SIZE_MAP = {
  default: "large",
  sm: "small",
} as const;

export const LikeButtonDsfr = ({
  liked,
  size = "default",
  onClickAction,
  children,
}: PropsWithChildren<LikeButtonDsfrProps>) => (
  <Button
    data-testid="like-button"
    title="Vote"
    iconId={liked ? "fr-icon-thumb-up-fill" : "fr-icon-thumb-up-line"}
    priority={liked ? "secondary" : "tertiary no outline"}
    size={SIZE_MAP[size]}
    onClick={onClickAction}
  >
    {children}
  </Button>
);
