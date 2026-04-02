"use client";

import { fr, type FrIconClassName } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { HeaderQuickAccessItem } from "@codegouvfr/react-dsfr/Header";
import { cx, type CxArg } from "@codegouvfr/react-dsfr/tools/cx";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { InitialsAvatar } from "@/components/img/InitialsAvatar";
import { config } from "@/config";
import { Icon } from "@/gouv/dsfr";
import { Link } from "@/i18n/navigation";
import { type UserMenuData } from "@/ui/AdminSidebar";

export const UserHeaderItem = ({
  pendingModerationCount = 0,
  userMenu,
}: {
  pendingModerationCount?: number;
  userMenu?: UserMenuData;
}) => {
  const session = useSession();
  const t = useTranslations("auth");
  const ts = useTranslations("sidebar");
  const tr = useTranslations("roles");

  switch (session.status) {
    case "authenticated": {
      const { user } = session.data;

      const menuSections: UserMenuSection[] = [];

      // Root admin
      if (userMenu?.isSuperAdmin) {
        menuSections.push({
          items: [
            {
              label: ts("administration"),
              iconId: "fr-icon-settings-5-line",
              linkProps: { href: "/admin" },
            },
          ],
        });
      }

      // Organizations + Tenants grouped
      if (userMenu && userMenu.organizations.length > 0) {
        const orgItems: UserMenuItem[] = [];
        for (const org of userMenu.organizations) {
          orgItems.push({
            label: (
              <>
                {org.name}
                <Badge as="span" small noIcon severity="info" className="ml-auto">
                  {tr(org.role as "OWNER")}
                </Badge>
              </>
            ),
            iconId: "fr-icon-building-line",
            linkProps: { href: org.orgAdminHref ?? "#" },
          });
          for (const tenant of org.tenants) {
            orgItems.push({
              label: (
                <>
                  <span className={!tenant.isMember ? "opacity-50" : ""}>{tenant.name}</span>
                  {tenant.isMember ? (
                    <Badge as="span" small noIcon severity="info" className="ml-auto">
                      {tr((tenant.role ?? "MEMBER") as "OWNER")}
                    </Badge>
                  ) : (
                    <Badge as="span" small noIcon severity="warning" className="ml-auto">
                      {ts("notRegistered")}
                    </Badge>
                  )}
                </>
              ),
              iconId: "fr-icon-layout-grid-line",
              linkProps: { href: tenant.isMember ? tenant.href : "#" },
            });
          }
        }
        menuSections.push({
          label: ts("workspaces"),
          items: orgItems,
        });
      }

      // Account section — always present
      menuSections.push({
        items: [
          {
            label: ts("profile"),
            iconId: "fr-icon-user-line",
            linkProps: { href: "/profile" },
          },
        ],
      });

      // Flatten sections into items with separators for UserMenuHeaderItem
      const allItems: UserMenuItem[] = menuSections.flatMap((section, i) => {
        const items = section.items.map(item => ({ ...item }));
        if (i > 0 && items.length > 0) {
          items[0] = { ...items[0], sectionLabel: section.label };
        } else if (i === 0 && section.label) {
          items[0] = { ...items[0], sectionLabel: section.label };
        }
        return items;
      });

      return (
        <UserMenuHeaderItem
          showLogout
          showUserInfo
          withOutline
          buttonLabel={t("mySpace")}
          notification={
            pendingModerationCount > 0 ? (
              <Badge as="span" small noIcon severity="new" className="ml-1">
                {t("new")}
              </Badge>
            ) : undefined
          }
          userName={
            <>
              {user.name}
              {user.image ? (
                <Image
                  src={new URL(user.image, config.espaceMembre.url).toString()}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full float-right"
                />
              ) : (
                <InitialsAvatar as="span" className="float-right" name={user.name || user.email.toLocaleUpperCase()} />
              )}
            </>
          }
          userEmail={user.email}
          onLogout={() => {
            void signOut({ redirectTo: "/" });
          }}
          items={allItems}
        />
      );
    }
    case "loading":
      return (
        <HeaderQuickAccessItem
          key="hqai-authloading-fake-user"
          quickAccessItem={{
            iconId: "fr-icon-account-fill",
            buttonProps: {
              onClick(e) {
                e.preventDefault();
              },
              className: fr.cx("fr-btn--tertiary"),
            },
            text: <Skeleton width="6rem" highlightColor="var(--text-action-high-blue-france)" />,
          }}
        />
      );
    default:
      return (
        <HeaderQuickAccessItem
          key="hqai-unauthenticated-login"
          quickAccessItem={{
            iconId: "fr-icon-lock-line",
            linkProps: {
              href: "/login",
              className: fr.cx("fr-btn--secondary"),
            },
            text: t("login"),
          }}
        />
      );
  }
};

interface UserMenuSection {
  items: UserMenuItem[];
  label?: string;
}

export interface UserMenuItem {
  iconId: FrIconClassName;
  isCurrent?: boolean;
  label: ReactNode;
  linkProps: { href: string };
  onClick?: () => void;
  /** Section label displayed above this item as a separator */
  sectionLabel?: string;
}

export interface UserMenuHeaderItemProps {
  buttonLabel?: string;
  className?: CxArg;
  items: UserMenuItem[];
  logoutHref?: string;
  notification?: ReactNode;
  onLogout?: () => void;
  showLogout?: boolean;
  showUserInfo?: boolean;
  userEmail?: ReactNode;
  userName?: ReactNode;
  withOutline?: boolean;
}

export function UserMenuHeaderItem({
  buttonLabel,
  withOutline = true,
  showUserInfo = true,
  showLogout = true,
  userName,
  userEmail,
  items,
  className,
  notification,
  onLogout,
  logoutHref = "/logout",
}: UserMenuHeaderItemProps) {
  const id = useId();
  const t = useTranslations("auth");
  const label = buttonLabel ?? t("mySpace");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuId = `user-menu-${id}`;
  const componentClass = "fr-user-menu";

  const toggleMenu = () => setOpen(v => !v);
  const closeMenu = () => setOpen(false);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <nav
      className={cx(componentClass, fr.cx("fr-nav", "fr-text--sm"), "self-center", className)}
      id={menuId}
      ref={menuRef}
    >
      <div className={fr.cx("fr-nav__item")}>
        <Button
          className={`${componentClass}__btn`}
          nativeButtonProps={{
            "aria-expanded": open ? "true" : "false",
            type: "button",
            title: label,
          }}
          priority={withOutline ? "tertiary" : "tertiary no outline"}
          size="small"
          iconId="fr-icon-account-fill"
          onClick={toggleMenu}
        >
          <Icon
            className={`${componentClass}__btn-label`}
            icon="fr-icon-arrow-down-s-line"
            text={
              <>
                {label}
                {notification}
              </>
            }
            iconPosition="right"
          />
        </Button>

        <div className={cx(fr.cx("fr-menu"), `${componentClass}__menu`)} style={{ display: open ? "block" : "none" }}>
          <ul className={fr.cx("fr-menu__list")} role="menu">
            {showUserInfo && (
              <li className={`${componentClass}__header`}>
                <p className={cx(`${componentClass}__name`)}>{userName}</p>
                <p className={cx(`${componentClass}__email`, fr.cx("fr-text--xs"))}>{userEmail}</p>
              </li>
            )}

            {items.map((item, index) => (
              <li key={index}>
                {item.sectionLabel && (
                  <p
                    className={cx(
                      fr.cx("fr-text--xs", "fr-text--bold", "fr-mb-1v", "fr-mt-2v"),
                      "uppercase tracking-wider opacity-60",
                    )}
                    style={{ paddingLeft: "1rem", fontSize: "0.625rem" }}
                  >
                    {item.sectionLabel}
                  </p>
                )}
                <Link
                  {...item.linkProps}
                  className={fr.cx("fr-nav__link")}
                  onClick={() => {
                    closeMenu();
                    item.onClick?.();
                  }}
                  aria-current={item.isCurrent}
                >
                  <Icon icon={item.iconId} text={item.label} />
                </Link>
              </li>
            ))}

            {showLogout && logoutHref && (
              <>
                <li className={`${componentClass}__logout`}>
                  <Button
                    priority="tertiary"
                    iconId="fr-icon-logout-box-r-line"
                    size="large"
                    linkProps={{
                      href: logoutHref,
                      onClick(e) {
                        e.preventDefault();
                        closeMenu();
                        onLogout?.();
                      },
                    }}
                  >
                    {t("logout")}
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
