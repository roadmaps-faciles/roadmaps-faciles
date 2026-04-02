import { type LucideIcon, Sparkles, Star, TrendingUp } from "lucide-react";

export const ORDER_ENUM = {
  trending: "trending",
  top: "top",
  new: "new",
} as const;
export const ORDER_OPTIONS = {
  trending: {
    label: "Tendance",
    icon: TrendingUp,
    default: true,
  },
  top: {
    label: "Top",
    icon: Star,
    default: false,
  },
  new: {
    label: "Nouveau",
    icon: Sparkles,
    default: false,
  },
} as const satisfies Record<Order, { default: boolean; icon: LucideIcon; label: string }>;
export const defaultOrder = Object.keys(ORDER_OPTIONS).find(key => ORDER_OPTIONS[key as Order].default) as Order;
export type Order = keyof typeof ORDER_ENUM;

export const VIEW_ENUM = {
  cards: "cards",
  list: "list",
  // TODO: réactiver kanban et kanban-accordion quand les wireframes seront implémentés
  // kanban: "kanban",
  // "kanban-accordion": "kanban-accordion",
} as const;
export type View = keyof typeof VIEW_ENUM;
export const defaultView: View = "cards";
