"use client";

import {
  Button,
  cn,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@roadmaps-faciles/ui";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { ThemeToggle } from "./ThemeToggle";

export interface HeaderProps {
  brandName?: React.ReactNode;
  className?: string;
  homeLinkProps: { href: string; title: string };
  mobileUserMenu?: React.ReactNode;
  navigation?: React.ReactNode;
  quickAccessItems?: React.ReactNode;
  serviceName?: string;
  variant?: "root" | "tenant";
}

/**
 * Unified header - root and tenant variants.
 *
 * Root: h-16, max-w-7xl, brandName ReactNode (icon + name + badge).
 * Tenant: h-14, container, serviceName string.
 */
export const Header = ({
  homeLinkProps,
  serviceName,
  brandName,
  navigation,
  quickAccessItems,
  mobileUserMenu,
  className,
  variant = "tenant",
}: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRoot = variant === "root";

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={cn(
        "z-50 w-full border-b",
        isRoot
          ? "sticky top-0 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background",
        className,
      )}
    >
      <div className={cn("mx-auto flex items-center", isRoot ? "h-16 max-w-7xl px-6" : "h-14 px-4 sm:px-6 lg:px-8")}>
        <Link
          href={homeLinkProps.href}
          title={homeLinkProps.title}
          className={cn("flex items-center", isRoot ? "mr-8 gap-2 text-lg font-bold tracking-tight" : "mr-6 space-x-2")}
        >
          {isRoot && brandName ? brandName : <span className="font-bold">{serviceName}</span>}
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className={cn("hidden flex-1 items-center text-sm font-medium md:flex", isRoot ? "gap-6" : "space-x-6")}
        >
          {navigation}
        </nav>

        <div className={cn("hidden items-center md:flex", isRoot ? "gap-4" : "space-x-2")}>
          <ThemeToggle />
          {quickAccessItems}
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden" aria-expanded={mobileOpen}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="flex w-[300px] flex-col gap-0 p-0 sm:w-[340px]">
            {/* Sheet header - title + theme toggle */}
            <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
              <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
              <ThemeToggle compact />
            </SheetHeader>

            {/* Scrollable content */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              {/* User menu section (when logged in) */}
              {mobileUserMenu && (
                <div className="flex flex-col gap-0.5 px-3 py-3" onClick={closeMobile}>
                  {mobileUserMenu}
                </div>
              )}

              {mobileUserMenu && <Separator />}

              {/* Navigation links */}
              <nav
                className={cn(
                  "flex flex-col gap-1.5 px-3 py-3",
                  "[&>a]:flex [&>a]:items-center [&>a]:gap-3 [&>a]:rounded-xl [&>a]:border [&>a]:border-border/50 [&>a]:px-4 [&>a]:py-3 [&>a]:text-[15px] [&>a]:font-medium [&>a]:transition-colors",
                  "[&>a:hover]:bg-accent [&>a[class*='text-foreground']]:border-primary/20 [&>a[class*='text-foreground']]:bg-accent/50",
                )}
                onClick={closeMobile}
              >
                {navigation}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
