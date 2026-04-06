"use client";

import { cn } from "@roadmaps-faciles/ui";
import Image from "next/image";

import { config } from "@/config";

import { InitialsAvatar } from "./InitialsAvatar";

export interface UserAvatarProps {
  className?: string;
  image?: null | string;
  name: string;
}

export const UserAvatar = ({ name, image, className }: UserAvatarProps) => {
  if (image) {
    const src = image.startsWith("http")
      ? image
      : new URL(image, config.espaceMembre.url).toString();
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <InitialsAvatar
      as="span"
      name={name}
      className={cn("shrink-0", className)}
    />
  );
};
