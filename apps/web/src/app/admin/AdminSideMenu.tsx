"use client";

import {
  Building2,
  ChartLine,
  Database,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  ScrollText,
  Settings2,
  Shield,
  ToggleLeft,
  Users,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { config } from "@/config";
import { AdminSidebar, type NavGroup, type UserMenuData } from "@/ui/AdminSidebar";

interface AdminSideMenuProps {
  isDev: boolean;
  showAnalyticsDebug: boolean;
  userMenu: UserMenuData;
}

export const AdminSideMenu = ({ userMenu, isDev, showAnalyticsDebug }: AdminSideMenuProps) => {
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
        ...(isDev ? [{ label: t("prismaStudio"), href: "/admin/prisma", icon: Database }] : []),
        { label: t("auditLog.title"), href: "/admin/audit-log", icon: ScrollText },
      ],
    },
    {
      label: t("groups.tools"),
      items: [
        { label: t("config.menu"), href: "/admin/config", icon: Settings2 },
        { label: t("emailTest.menu"), href: "/admin/email-test", icon: Mail },
        ...(showAnalyticsDebug
          ? [{ label: t("analyticsDebug.menu"), href: "/admin/analytics-debug", icon: ChartLine }]
          : []),
        ...(isDev ? [{ label: t("devTools.menu"), href: "/admin/dev-tools", icon: Wrench }] : []),
      ],
    },
  ];

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
      userMenu={userMenu}
    />
  );
};
