"use client";

import {
  Building2,
  Database,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  ScrollText,
  Shield,
  ToggleLeft,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { config } from "@/config";
import { AdminSidebar, type NavGroup, type UserMenuData } from "@/ui/AdminSidebar";

import { DevToolsPanel } from "./DevToolsPanel";

interface AdminSideMenuProps {
  isDev: boolean;
  userMenu: UserMenuData;
  useStripe: boolean;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

export const AdminSideMenu = ({ userMenu, isDev, useStripe }: AdminSideMenuProps) => {
  const t = useTranslations("rootAdmin");

  const groups: NavGroup[] = [
    {
      label: t("groups.management"),
      items: [
        { label: t("tenants"), href: "/admin/tenants", icon: LayoutDashboard },
        { label: t("organizations"), href: "/admin/organizations", icon: Building2 },
        { label: t("users"), href: "/admin/users", icon: Users },
      ],
    },
    {
      label: t("groups.security"),
      items: [
        { label: t("authentication.menu"), href: "/admin/authentication", icon: LockKeyhole },
        { label: t("security.menu"), href: "/admin/security", icon: Shield },
        { label: t("licensing.menu"), href: "/admin/licensing", icon: KeyRound },
        { label: t("featureFlags.menu"), href: "/admin/feature-flags", icon: ToggleLeft },
      ],
    },
    {
      label: t("groups.developers"),
      items: [
        { label: t("prismaStudio"), href: "/admin/prisma", icon: Database },
        { label: t("auditLog.title"), href: "/admin/audit-log", icon: ScrollText },
      ],
    },
  ];

  const devToggles = isDev
    ? [
        {
          id: "useStripe",
          label: "Stripe Checkout",
          description: "Utiliser le vrai flow Stripe au lieu du dev-checkout",
          defaultValue: useStripe,
          onChangeAction: (value: boolean) => {
            setCookie("dev-use-stripe", value ? "1" : "0");
            window.location.reload();
          },
        },
      ]
    : [];

  return (
    <AdminSidebar
      title="Roadmaps Faciles"
      subtitle="Administration"
      icon={<Image src="/img/roadmaps-faciles.png" alt="" width={20} height={20} className="size-5" />}
      iconBg={false}
      groups={groups}
      backHref="/"
      backLabel={t("backToSite")}
      footer={{ status: t("systemOperational"), version: `v${config.appVersion}` }}
      devTools={isDev ? <DevToolsPanel toggles={devToggles} /> : undefined}
      userMenu={userMenu}
    />
  );
};
