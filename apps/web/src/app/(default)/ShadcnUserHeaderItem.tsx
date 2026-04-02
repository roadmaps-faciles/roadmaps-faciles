"use client";

import {
  Badge,
  Button,
  cn,
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
import { ArrowRight, Building2, ChevronsUpDown, LayoutDashboard, LogOut, Monitor, User } from "lucide-react";
import { motion } from "motion/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { InitialsAvatar } from "@/components/img/InitialsAvatar";
import { type UserMenuData } from "@/ui/AdminSidebar";
import { useRovingHighlight } from "@/ui/useRovingHighlight";

export interface ShadcnUserHeaderItemProps {
  /** "dropdown" = desktop DropdownMenu, "sheet" = inline items for mobile Sheet */
  mode?: "dropdown" | "sheet";
  /** Pending moderation posts count — shown as badge on the trigger button */
  pendingModerationCount?: number;
  /** User menu data from server — sections align with sidebar user menu */
  userMenu?: UserMenuData;
}

// Force-override Radix's focus/highlighted styles so our custom highlight is the only visual
const itemStyle = { backgroundColor: "transparent", color: "inherit" } as const;
const itemClass = "relative flex items-center gap-2 outline-none px-2 py-1.5 text-sm";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
    {children}
  </DropdownMenuLabel>
);

const RoleBadge = ({ role }: { role: string }) => {
  const tr = useTranslations("roles");
  return (
    <Badge variant="outline" className="ml-auto shrink-0 px-1.5 py-0 text-[10px]">
      {tr(role as "OWNER")}
    </Badge>
  );
};

const MenuItemContent = ({ children }: { children: React.ReactNode }) => (
  <span className="relative z-10 flex items-center gap-2">{children}</span>
);

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
              <InitialsAvatar as="span" name={displayName} className="size-10 shrink-0 text-sm" />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
                <Badge variant="outline" className="mt-1.5 w-fit px-1.5 py-0 text-[10px]">
                  {tr(roleLabelKey as "OWNER")}
                </Badge>
              </div>
            </div>

            {/* Root admin */}
            {userMenu?.isSuperAdmin && (
              <div className="mt-2">
                <Link href="/admin" className={sheetItemClass}>
                  <Monitor className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{t("administration")}</span>
                </Link>
              </div>
            )}

            {/* Organizations + Tenants */}
            {userMenu && userMenu.organizations.length > 0 && (
              <div className="mt-2">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {t("workspaces")}
                </p>
                {userMenu.organizations.map(org => (
                  <div key={org.id}>
                    <Link
                      href={org.orgAdminHref ?? "#"}
                      className={cn(sheetItemClass, !org.orgAdminHref && "pointer-events-none")}
                    >
                      <Building2 className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium">{org.name}</span>
                      <RoleBadge role={org.role} />
                    </Link>
                    {org.tenants.map(tenant => (
                      <Link
                        key={tenant.id}
                        href={tenant.isMember ? tenant.href : "#"}
                        className={cn(
                          sheetItemClass,
                          "pl-10 text-sm",
                          tenant.id === userMenu.currentTenantId && "bg-accent",
                          !tenant.isMember && "opacity-50",
                        )}
                      >
                        <LayoutDashboard className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{tenant.name}</span>
                        {tenant.isMember ? (
                          <RoleBadge role={tenant.role ?? "MEMBER"} />
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            {t("notRegistered")}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}

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
        <DropdownMenu onOpenChange={clearHighlight}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <InitialsAvatar as="span" name={displayName} className="size-7 shrink-0 rounded-lg text-[10px]" />
              <span className="hidden sm:inline">{displayName}</span>
              {pendingModerationCount > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                  {pendingModerationCount}
                </Badge>
              )}
              <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground/40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="relative min-w-72 max-h-[70vh] overflow-y-auto">
            <DropdownMenuArrow />

            {/* Roving highlight — animated background that follows hovered items */}
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
              <InitialsAvatar as="span" name={displayName} className="size-9 shrink-0 text-xs" />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
                <Badge variant="outline" className="mt-1 w-fit px-1.5 py-0 text-[10px]">
                  {tr(roleLabelKey as "OWNER")}
                </Badge>
              </div>
            </DropdownMenuLabel>

            {/* Root admin */}
            {userMenu?.isSuperAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
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
                </DropdownMenuGroup>
              </>
            )}

            {/* Organizations + Tenants grouped */}
            {userMenu && userMenu.organizations.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <SectionLabel>{t("workspaces")}</SectionLabel>
                {userMenu.organizations.map(org => (
                  <DropdownMenuGroup key={org.id}>
                    <DropdownMenuItem asChild>
                      <Link
                        href={org.orgAdminHref ?? "#"}
                        className={cn(itemClass, !org.orgAdminHref && "pointer-events-none")}
                        style={itemStyle}
                        onMouseEnter={handleItemHover}
                        onMouseLeave={clearHighlight}
                      >
                        <MenuItemContent>
                          <Building2 className="size-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate font-medium">{org.name}</span>
                          <RoleBadge role={org.role} />
                        </MenuItemContent>
                      </Link>
                    </DropdownMenuItem>
                    {org.tenants.map(tenant => (
                      <DropdownMenuItem key={tenant.id} asChild>
                        <Link
                          href={tenant.isMember ? tenant.href : "#"}
                          className={cn(
                            itemClass,
                            "pl-6",
                            tenant.id === userMenu.currentTenantId && "bg-accent/50",
                            !tenant.isMember && "opacity-50",
                          )}
                          style={itemStyle}
                          onMouseEnter={handleItemHover}
                          onMouseLeave={clearHighlight}
                        >
                          <MenuItemContent>
                            <LayoutDashboard className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate text-sm">{tenant.name}</span>
                            {tenant.isMember ? (
                              <RoleBadge role={tenant.role ?? "MEMBER"} />
                            ) : (
                              <Badge variant="outline" className="ml-auto shrink-0 px-1.5 py-0 text-[10px]">
                                {t("notRegistered")}
                              </Badge>
                            )}
                          </MenuItemContent>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                ))}
              </>
            )}

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
