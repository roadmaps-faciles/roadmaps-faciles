"use client";

import { Button as ShadcnButton } from "@roadmaps-faciles/ui";
import * as Sentry from "@sentry/nextjs";
import { ThumbsUp } from "lucide-react";
import { lazy, type PropsWithChildren, startTransition, Suspense, useState } from "react";
import UseAnimations from "react-useanimations";
import thumbUp from "react-useanimations/lib/thumbUp";

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
  const [hasInteracted, setHasInteracted] = useState(false);
  const theme = useUI();

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setHasInteracted(true);
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

  if (!hasInteracted && liked) {
    return (
      <ShadcnButton title="Vote" variant="secondary" size={size} onClick={handleLikeToggle}>
        <ThumbsUp className="size-5 fill-current" />
        {children}
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton title="Vote" variant={liked ? "secondary" : "ghost"} size={size} onClick={handleLikeToggle}>
      {hasInteracted ? (
        <UseAnimations animation={thumbUp} size={24} reverse={liked} strokeColor="currentColor" />
      ) : (
        <ThumbsUp className="size-5" />
      )}
      {children}
    </ShadcnButton>
  );
};
