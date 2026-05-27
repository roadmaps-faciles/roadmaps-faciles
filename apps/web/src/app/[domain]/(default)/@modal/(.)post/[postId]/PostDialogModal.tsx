"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roadmaps-faciles/ui";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, type ReactNode, useCallback, useRef, useState } from "react";

export interface PostDialogModalProps extends PropsWithChildren {
  title: ReactNode;
}

export const PostDialogModal = ({ title, children }: PostDialogModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const closing = useRef(false);

  const handleClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOpen(false);
    setTimeout(() => router.back(), 200);
  }, [router]);

  return (
    <>
      <style>{`[data-slot="dialog-overlay"] { z-index: var(--z-modal-overlay) !important; }`}</style>
      <Dialog open={open} onOpenChange={val => !val && handleClose()}>
        <DialogContent className="z-(--z-modal) max-h-[85vh] max-w-5xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="sr-only">{title}</DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Fermer
            </Button>
            <DialogClose asChild>
              <Button onClick={() => window.location.reload()}>Voir plus de détails</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
