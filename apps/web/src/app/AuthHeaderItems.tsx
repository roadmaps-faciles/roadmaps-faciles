"use client";

import { fr, type FrIconClassName } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { HeaderQuickAccessItem } from "@codegouvfr/react-dsfr/Header";
import { cx, type CxArg } from "@codegouvfr/react-dsfr/tools/cx";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { UserAvatar } from "@/components/img/UserAvatar";
import { Icon } from "@/gouv/dsfr";
import { Link } from "@/i18n/navigation";
import { type UserMenuData } from "@/ui/AdminSidebar";
import { WorkspaceSwitcher } from "@/ui/WorkspaceSwitcher";

const AuthenticatedUserMenu = ({
  pendingModerationCount,
  user,
  userMenu,
}: {
  pendingModerationCount: number;
  user: { email: string; image?: null | string; name?: null | string };
  userMenu?: UserMenuData;
}) => {
  const t = useTranslations("auth");
  const ts = useTranslations("sidebar");
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const menuItems: UserMenuItem[] = [];

  if (userMenu?.currentTenant) {
    menuItems.push({
      label: (
        <>
          {userMenu.currentTenant.name}
          <span className="ml-auto text-xs opacity-60">{userMenu.currentTenant.org.name}</span>
        </>
      ),
      iconId: "fr-icon-layout-grid-line",
      linkProps: { href: userMenu.currentTenant.adminHref ?? "#" },
      isCurrent: true,
    });
  }

  if (userMenu && userMenu.organizations.length > 0) {
    menuItems.push({
      label: ts("switchWorkspace"),
      iconId: "fr-icon-refresh-line",
      linkProps: { href: "#" },
      onClick: () => setSwitcherOpen(true),
    });
  }

  if (userMenu?.isSuperAdmin) {
    menuItems.push({
      label: ts("administration"),
      iconId: "fr-icon-settings-5-line",
      linkProps: { href: "/admin" },
    });
  }

  menuItems.push({
    label: ts("profile"),
    iconId: "fr-icon-user-line",
    linkProps: { href: "/profile" },
  });

  return (
    <>
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
            <UserAvatar name={user.name || user.email} image={user.image} className="size-10 float-right" />
          </>
        }
        userEmail={user.email}
        onLogout={() => {
          void signOut({ redirectTo: "/" });
        }}
        items={menuItems}
      />
      {userMenu && userMenu.organizations.length > 0 && (
        <WorkspaceSwitcher userMenu={userMenu} open={switcherOpen} onOpenChangeAction={setSwitcherOpen} />
      )}
    </>
  );
};

export const UserHeaderItem = ({
  pendingModerationCount = 0,
  userMenu,
}: {
  pendingModerationCount?: number;
  userMenu?: UserMenuData;
}) => {
  const session = useSession();
  const t = useTranslations("auth");

  switch (session.status) {
    case "authenticated":
      return (
        <AuthenticatedUserMenu
          pendingModerationCount={pendingModerationCount}
          user={session.data.user}
          userMenu={userMenu}
        />
      );
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
