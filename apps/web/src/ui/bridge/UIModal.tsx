"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roadmaps-faciles/ui";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UIModalDsfr = lazy(() => import("./UIModalDsfr").then(m => ({ default: m.UIModalDsfr })));

export type UIModalProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  open: boolean;
  title: React.ReactNode;
};

/**
 * Declarative modal bridge.
 *
 * - Default theme → shadcn Dialog
 * - Dsfr theme → DSFR createModal() (lazy loaded)
 */
export const UIModal = ({ open, onClose, title, children, footer }: UIModalProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIModalDsfr open={open} onClose={onClose} title={title} footer={footer}>
          {children}
        </UIModalDsfr>
      </Suspense>
    );
  }

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {children}
        {footer && (
          <DialogFooter>
            {footer}
            <DialogClose asChild>
              <button type="button" className="sr-only">
                Fermer
              </button>
            </DialogClose>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
