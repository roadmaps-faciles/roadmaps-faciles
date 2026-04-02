import { type AvatarProps } from "@mui/material/Avatar";
import { cn } from "@roadmaps-faciles/ui";

import styles from "./InitialsAvatar.module.scss";

/** Theme-agnostic avatar palette — pastel backgrounds with dark text. */
const AVATAR_PALETTE: Array<[bg: string, fg: string]> = [
  ["#c3fad5", "#1b4332"], // green
  ["#bde0fe", "#1d3557"], // blue
  ["#ffd6a5", "#6b3a00"], // orange
  ["#e2c2f8", "#3b1261"], // purple
  ["#ffc8dd", "#6b1d3a"], // pink
  ["#caffbf", "#1a5c1a"], // lime
  ["#a0c4ff", "#0a2463"], // sky
  ["#ffd670", "#5a3e00"], // yellow
  ["#d0bfff", "#2e1065"], // violet
  ["#ffadad", "#5c1a1a"], // red
];

export interface InitialsAvatarProps {
  as?: "div" | "span";
  className?: string;
  name: string;
  size?: number;
}

export const InitialsAvatar = ({ name, className, as = "div" }: InitialsAvatarProps) => {
  const initials = getInitials(name);
  const background = generateBackground(name);
  const Component = as;
  return (
    <Component
      className={cn(styles["initials-avatar"], className)}
      style={{ backgroundColor: background[0], color: background[1] }}
    >
      <span>{initials}</span>
    </Component>
  );
};

export function generateBackground(name: string) {
  const initials = getInitials(name);
  const colorIndex =
    (initials.charCodeAt(0) + (initials.charCodeAt(1) || initials.charCodeAt(0))) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[colorIndex];
}

export function getInitials(name: string) {
  const splited = name.split(" ");
  return splited[1]?.[0] ? `${splited[0][0]}${splited[1][0]}` : splited[0][0];
}

export function getMaterialAvatarProps(name: string): AvatarProps {
  const initials = getInitials(name);
  const background = generateBackground(name);
  return {
    sx: {
      bgcolor: background[0],
      color: background[1],
    },
    children: initials,
  };
}
