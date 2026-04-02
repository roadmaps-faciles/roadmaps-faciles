"use client";

import {
  Columns3,
  KeyRound,
  Map,
  Plug,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  Tag,
  Users,
  Webhook,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { config } from "@/config";
import { useFeatureFlag } from "@/lib/feature-flags/client";
import { AdminSidebar, type NavGroup, type UserMenuData } from "@/ui/AdminSidebar";

interface AdminSideMenuProps {
  pendingModerationCount?: number;
  tenantName: string;
  userMenu: UserMenuData;
}

export const AdminSideMenu = ({ tenantName, pendingModerationCount, userMenu }: AdminSideMenuProps) => {
  const t = useTranslations("domainAdmin.sideMenu");
  const integrationsEnabled = useFeatureFlag("integrations");

  const groups: NavGroup[] = [
    {
      label: t("configuration"),
      items: [
        { label: t("general"), href: "/admin/general", icon: Settings },
        { label: t("boards"), href: "/admin/boards", icon: Columns3 },
        { label: t("statuses"), href: "/admin/statuses", icon: Tag },
        { label: t("roadmap"), href: "/admin/roadmap", icon: Map },
      ],
    },
    {
      label: t("securityAccess"),
      items: [
        {
          label: t("users"),
          href: "/admin/users",
          icon: Users,
          matchPrefix: true,
          subItems: [
            { label: t("members"), href: "/admin/users" },
            { label: t("invitations"), href: "/admin/users/invitations" },
          ],
        },
        { label: t("authentication"), href: "/admin/authentication", icon: Shield },
        { label: t("api"), href: "/admin/api", icon: KeyRound },
      ],
    },
    {
      label: t("developers"),
      items: [
        { label: t("webhooks"), href: "/admin/webhooks", icon: Webhook },
        ...(integrationsEnabled
          ? [{ label: t("integrations"), href: "/admin/integrations", icon: Plug, matchPrefix: true as const }]
          : []),
        { label: t("auditLog"), href: "/admin/audit-log", icon: ScrollText },
      ],
    },
  ];

  return (
    <AdminSidebar
      title={tenantName}
      subtitle="Administration"
      icon={<Image src="/img/roadmaps-faciles.png" alt="" width={20} height={20} className="size-5" />}
      iconBg={false}
      groups={groups}
      extraItems={[
        {
          label: t("moderation"),
          href: "/moderation",
          icon: ShieldAlert,
          ...(pendingModerationCount ? { badge: pendingModerationCount } : {}),
        },
      ]}
      backHref="/"
      backLabel={t("backToSite")}
      footer={{ status: t("systemOperational"), version: `v${config.appVersion}` }}
      userMenu={userMenu}
    />
  );
};
