"use client";

import { cn } from "@roadmaps-faciles/ui";

import { config } from "@/config";

import { InitialsAvatar } from "./InitialsAvatar";

export interface UserAvatarProps {
  className?: string;
  image?: null | string;
  name: string;
}

export const UserAvatar = ({ name, image, className }: UserAvatarProps) => {
  if (image) {
    const src = image.startsWith("http") ? image : new URL(image, config.espaceMembre.url).toString();
    return (
      <img
        src={src}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return <InitialsAvatar as="span" name={name} className={cn("shrink-0", className)} />;
};
