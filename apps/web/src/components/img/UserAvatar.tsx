"use client";

import { cn } from "@roadmaps-faciles/ui";
import Image from "next/image";

import { config } from "@/config";

import { InitialsAvatar } from "./InitialsAvatar";

export interface UserAvatarProps {
  className?: string;
  image?: null | string;
  name: string;
  /**
   * Taille en pixels passée à `next/image` (width/height). Par défaut 40px ;
   * augmenter quand l'avatar est rendu plus grand (preview profile, etc.) pour
   * éviter l'upscaling pixelisé.
   */
  size?: number;
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

export const UserAvatar = ({ name, image, className, size = 40 }: UserAvatarProps) => {
  if (image) {
    return (
      <Image
        src={resolveAvatarSrc(image)}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return <InitialsAvatar as="span" name={name} className={cn("shrink-0", className)} />;
};
