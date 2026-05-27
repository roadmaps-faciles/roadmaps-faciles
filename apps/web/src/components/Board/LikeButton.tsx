"use client";

import { Button as ShadcnButton } from "@roadmaps-faciles/ui";
import { cn } from "@roadmaps-faciles/ui/lib/cn";
import * as Sentry from "@sentry/nextjs";
import { ThumbsUp } from "lucide-react";
import { lazy, type PropsWithChildren, startTransition, Suspense, useState } from "react";

import { useUI } from "@/ui";

import { likePost } from "./actions";

const LikeButtonDsfr = lazy(() => import("./LikeButtonDsfr").then(m => ({ default: m.LikeButtonDsfr })));

interface LikeButtonProps {
  alreadyLiked: boolean;
  postId: number;
  size?: "default" | "sm";
  tenantId: number;
  userId?: string;
}

export const LikeButton = ({
  userId,
  postId,
  tenantId,
  alreadyLiked,
  children,
  size = "default",
}: PropsWithChildren<LikeButtonProps>) => {
  const [liked, setLiked] = useState(alreadyLiked);
  const theme = useUI();
  const iconSizeClass = size === "sm" ? "size-5" : "size-6";

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();

    startTransition(() => {
      setLiked(prevLiked => !prevLiked);
    });

    likePost(
      {
        postId,
        tenantId,
        userId,
      },
      liked,
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(response.error);
        }
      })
      .catch(error => {
        Sentry.captureException(error);

        startTransition(() => {
          setLiked(prevLiked => !prevLiked);
        });
      });
  };

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <LikeButtonDsfr liked={liked} size={size} onClickAction={handleLikeToggle}>
          {children}
        </LikeButtonDsfr>
      </Suspense>
    );
  }

  return (
    <ShadcnButton title="Vote" variant={liked ? "secondary" : "ghost"} size={size} onClick={handleLikeToggle}>
      <ThumbsUp className={cn(iconSizeClass, liked && "fill-current stroke-primary")} />
      {children}
    </ShadcnButton>
  );
};
