"use client";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from "@roadmaps-faciles/ui";
import { ArrowRight, Building2, ChevronsUpDown, LayoutDashboard, LogOut, Monitor, Repeat, User } from "lucide-react";
import { motion } from "motion/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { UserAvatar } from "@/components/img/UserAvatar";
import { type UserMenuData } from "@/ui/AdminSidebar";
import { useRovingHighlight } from "@/ui/useRovingHighlight";
import { WorkspaceSwitcher } from "@/ui/WorkspaceSwitcher";

export interface ShadcnUserHeaderItemProps {
  /** "dropdown" = desktop DropdownMenu, "sheet" = inline items for mobile Sheet */
  mode?: "dropdown" | "sheet";
  /** Pending moderation posts count - shown as badge on the trigger button */
  pendingModerationCount?: number;
  /** User menu data from server - sections align with sidebar user menu */
  userMenu?: UserMenuData;
}

// Force-override Radix's focus/highlighted styles so our custom highlight is the only visual
const itemStyle = { backgroundColor: "transparent", color: "inherit" } as const;
const itemClass = "relative flex items-center gap-2 outline-none px-2 py-1.5 text-sm";

const MenuItemContent = ({ children }: { children: React.ReactNode }) => (
  <span className="relative z-10 flex items-center gap-2">{children}</span>
);

const DropdownMenuSwitcherTrigger = ({
  clearHighlight,
  handleItemHover,
  onOpenAction,
}: {
  clearHighlight: () => void;
  handleItemHover: (event: React.MouseEvent) => void;
  onOpenAction: () => void;
}) => {
  const t = useTranslations("sidebar");

  return (
    <DropdownMenuItem
      className={itemClass}
      style={itemStyle}
      onMouseEnter={handleItemHover}
      onMouseLeave={clearHighlight}
      onSelect={e => {
        e.preventDefault();
        onOpenAction();
      }}
    >
      <MenuItemContent>
        <Repeat className="size-4 shrink-0 text-muted-foreground" />
        <span>{t("switchWorkspace")}</span>
        <kbd className="ml-auto rounded-sm border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
      </MenuItemContent>
    </DropdownMenuItem>
  );
};

const SheetWorkspaceSwitcherTrigger = ({ className }: { className: string }) => {
  const t = useTranslations("sidebar");

  return (
    <button
      type="button"
      onClick={() => {
        document.dispatchEvent(new CustomEvent("open-workspace-switcher"));
      }}
      className={className}
    >
      <Repeat className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1">{t("switchWorkspace")}</span>
    </button>
  );
};

export const ShadcnUserHeaderItem = ({
  mode = "dropdown",
  pendingModerationCount = 0,
  userMenu,
}: ShadcnUserHeaderItemProps) => {
  const session = useSession();
  const t = useTranslations("sidebar");
  const tAuth = useTranslations("auth");
  const tr = useTranslations("roles");
  const { clearHighlight, handleItemHover, highlight } = useRovingHighlight('[data-slot="dropdown-menu-content"]');
  const [switcherOpen, setSwitcherOpen] = useState(false);

  switch (session.status) {
    case "authenticated": {
      const { user } = session.data;
      const displayName = userMenu?.user.name || user.name || user.email;
      const email = userMenu?.user.email ?? user.email;
      const roleLabelKey = user.isSuperAdmin ? "superAdmin" : (user.currentTenantRole ?? "MEMBER");

      // --- Sheet mode: inline items for mobile side sheet ---
      if (mode === "sheet") {
        const sheetItemClass =
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-accent";

        return (
          <>
            {/* User card */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <UserAvatar name={displayName} image={user.image} className="size-10 text-sm" />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
                <Badge variant="outline" className="mt-1.5 w-fit px-1.5 py-0 text-[10px]">
                  {tr(roleLabelKey as "OWNER")}
                </Badge>
              </div>
            </div>

            {/* Current tenant context */}
            {userMenu?.currentTenant && (
              <div className="mt-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-semibold">{userMenu.currentTenant.name}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 pl-6">
                  <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground">{userMenu.currentTenant.org.name}</span>
                </div>
                {(userMenu.currentTenant.adminHref || userMenu.currentTenant.org.adminHref) && (
                  <div className="mt-2 flex gap-2 pl-6">
                    {userMenu.currentTenant.adminHref && (
                      <Link href={userMenu.currentTenant.adminHref} className="text-xs text-primary hover:underline">
                        {t("tenantAdmin")}
                      </Link>
                    )}
                    {userMenu.currentTenant.org.adminHref && (
                      <Link
                        href={userMenu.currentTenant.org.adminHref}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("orgAdmin")}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-2">
              {/* Switch workspace */}
              {userMenu && userMenu.organizations.length > 0 && (
                <SheetWorkspaceSwitcherTrigger className={sheetItemClass} />
              )}

              {/* Root admin */}
              {userMenu?.isGlobalAdmin && (
                <Link href="/admin" className={sheetItemClass}>
                  <Monitor className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{t("administration")}</span>
                </Link>
              )}
            </div>

            {/* Account section */}
            <div className="mt-1 border-t pt-2">
              <Link href="/profile" className={sheetItemClass}>
                <User className="size-4 shrink-0" />
                <span className="flex-1">{t("profile")}</span>
              </Link>
              <button type="button" onClick={() => void signOut({ redirectTo: "/" })} className={sheetItemClass}>
                <LogOut className="size-4 shrink-0" />
                <span className="flex-1 text-left">{t("logout")}</span>
              </button>
            </div>
          </>
        );
      }

      // --- Dropdown mode: desktop DropdownMenu ---
      return (
        <>
          <DropdownMenu onOpenChange={clearHighlight}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto gap-1 px-1.5 py-1" aria-label={displayName}>
                <span className="relative">
                  <UserAvatar name={displayName} image={user.image} className="size-8 rounded-lg text-xs" />
                  {pendingModerationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px] leading-none"
                    >
                      {pendingModerationCount}
                    </Badge>
                  )}
                </span>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="relative min-w-72 max-h-[70vh] overflow-y-auto">
              <DropdownMenuArrow />

              {/* Roving highlight - animated background that follows hovered items */}
              {highlight && (
                <motion.div
                  className="pointer-events-none absolute inset-x-1 top-0 z-0 rounded-sm bg-accent"
                  initial={false}
                  animate={{ y: highlight.y, height: highlight.height }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                />
              )}

              {/* User info header */}
              <DropdownMenuLabel className="flex items-center gap-3 p-3 font-normal">
                <UserAvatar name={displayName} image={user.image} className="size-9 text-xs" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                  <Badge variant="outline" className="mt-1 w-fit px-1.5 py-0 text-[10px]">
                    {tr(roleLabelKey as "OWNER")}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              {/* Current tenant context */}
              {userMenu?.currentTenant && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-semibold">{userMenu.currentTenant.name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 pl-6">
                        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-xs text-muted-foreground">
                          {userMenu.currentTenant.org.name}
                        </span>
                      </div>
                      {(userMenu.currentTenant.adminHref || userMenu.currentTenant.org.adminHref) && (
                        <div className="mt-1.5 flex gap-3 pl-6">
                          {userMenu.currentTenant.adminHref && (
                            <Link
                              href={userMenu.currentTenant.adminHref}
                              className="text-xs text-primary hover:underline"
                            >
                              {t("tenantAdmin")}
                            </Link>
                          )}
                          {userMenu.currentTenant.org.adminHref && (
                            <Link
                              href={userMenu.currentTenant.org.adminHref}
                              className="text-xs text-primary hover:underline"
                            >
                              {t("orgAdmin")}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </DropdownMenuGroup>
                </>
              )}

              {/* Switch workspace + admin */}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {userMenu && userMenu.organizations.length > 0 && (
                  <DropdownMenuSwitcherTrigger
                    clearHighlight={clearHighlight}
                    handleItemHover={handleItemHover}
                    onOpenAction={() => setSwitcherOpen(true)}
                  />
                )}

                {/* Root admin */}
                {userMenu?.isGlobalAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className={itemClass}
                      style={itemStyle}
                      onMouseEnter={handleItemHover}
                      onMouseLeave={clearHighlight}
                    >
                      <MenuItemContent>
                        <Monitor className="size-4 shrink-0 text-muted-foreground" />
                        <span>{t("administration")}</span>
                      </MenuItemContent>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              {/* Account section */}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className={itemClass}
                    style={itemStyle}
                    onMouseEnter={handleItemHover}
                    onMouseLeave={clearHighlight}
                  >
                    <MenuItemContent>
                      <User className="size-4 shrink-0" />
                      <span>{t("profile")}</span>
                    </MenuItemContent>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={itemClass}
                  style={itemStyle}
                  onMouseEnter={handleItemHover}
                  onMouseLeave={clearHighlight}
                  onSelect={() => void signOut({ redirectTo: "/" })}
                >
                  <MenuItemContent>
                    <LogOut className="size-4 shrink-0" />
                    <span>{t("logout")}</span>
                  </MenuItemContent>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {userMenu && userMenu.organizations.length > 0 && (
            <WorkspaceSwitcher userMenu={userMenu} open={switcherOpen} onOpenChangeAction={setSwitcherOpen} />
          )}
        </>
      );
    }
    case "loading":
      return <Skeleton className="h-8 w-24" />;
    default:
      return (
        <>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {tAuth("login")}
          </Link>
          <Button size="sm" asChild>
            <Link href="/login">
              {tAuth("getStarted")}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </>
      );
  }
};
