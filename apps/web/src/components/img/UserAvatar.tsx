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

/**
 * Résolution de la source :
 *   - URL absolue (http/https) → utilisée telle quelle (avatar OAuth, EM en
 *     mode URL absolue)
 *   - `/api/uploads/...` → upload interne, on garde relatif pour rester sur le
 *     host courant (tenant ou root)
 *   - autre chemin relatif → assumé legacy EM (image hostée sur espace-membre)
 */
const resolveAvatarSrc = (image: string): string => {
  if (image.startsWith("http")) return image;
  if (image.startsWith("/api/uploads/")) return image;
  return new URL(image, config.espaceMembre.url).toString();
};

export const UserAvatar = ({ name, image, className }: UserAvatarProps) => {
  if (image) {
    return (
      <Image
        src={resolveAvatarSrc(image)}
        alt={name}
        width={40}
        height={40}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return <InitialsAvatar as="span" name={name} className={cn("shrink-0", className)} />;
};
