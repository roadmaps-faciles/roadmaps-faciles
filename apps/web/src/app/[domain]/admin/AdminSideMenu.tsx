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
import { ADDON_TYPE } from "@/lib/model/Organization";
import { AdminSidebar, type NavGroup, type UserMenuData } from "@/ui/AdminSidebar";
import { SystemStatusWidget } from "@/ui/SystemStatusWidget";

interface AdminSideMenuProps {
  /** Per-addon entitlement of the current tenant: drives the lock marker on paid items. */
  entitlements: Partial<Record<string, boolean>>;
  pendingModerationCount?: number;
  tenantName: string;
  userMenu: UserMenuData;
}

export const AdminSideMenu = ({ tenantName, pendingModerationCount, userMenu, entitlements }: AdminSideMenuProps) => {
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
        {
          label: t("authentication"),
          href: "/admin/authentication",
          icon: Shield,
          locked: !entitlements[ADDON_TYPE.SSO_ENTERPRISE],
        },
        { label: t("api"), href: "/admin/api", icon: KeyRound, locked: !entitlements[ADDON_TYPE.API_KEYS] },
      ],
    },
    {
      label: t("developers"),
      items: [
        { label: t("webhooks"), href: "/admin/webhooks", icon: Webhook, locked: !entitlements[ADDON_TYPE.WEBHOOKS] },
        ...(integrationsEnabled
          ? [
              {
                label: t("integrations"),
                href: "/admin/integrations",
                icon: Plug,
                matchPrefix: true as const,
                locked: !entitlements[ADDON_TYPE.INTEGRATIONS],
              },
            ]
          : []),
        {
          label: t("auditLog"),
          href: "/admin/audit-log",
          icon: ScrollText,
          locked: !entitlements[ADDON_TYPE.AUDIT_LOG],
        },
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
      footer={{ content: <SystemStatusWidget version={`v${config.appVersion}`} /> }}
      userMenu={userMenu}
    />
  );
};
