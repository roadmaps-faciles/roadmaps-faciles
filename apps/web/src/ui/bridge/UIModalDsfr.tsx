"use client";

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useEffect, useId, useRef, useState } from "react";

import { type UIModalProps } from "./UIModal";

export const UIModalDsfr = ({ open, onClose, title, children, footer }: UIModalProps) => {
  const reactId = useId();
  const id = `ui-modal-bridge-${reactId.replace(/:/g, "")}`;
  const [modal] = useState(() => createModal({ id, isOpenedByDefault: false }));
  const hasBeenOpenedRef = useRef(false);

  // Sync open prop → DSFR modal (disclose / conceal)
  useEffect(() => {
    if (open) {
      hasBeenOpenedRef.current = true;
      modal.open();
    } else if (hasBeenOpenedRef.current) {
      // Only close when transitioning from open → closed, not on initial mount
      modal.close();
    }
  }, [open, modal]);

  // Sync DSFR close (user clicks X / backdrop / Escape) → onClose callback
  useEffect(() => {
    if (!onClose) return;
    const el = document.getElementById(id);
    if (!el) return;

    const handler = () => onClose();
    el.addEventListener("dsfr.conceal", handler);
    return () => el.removeEventListener("dsfr.conceal", handler);
  }, [id, onClose]);

  return (
    <modal.Component title={title}>
      {children}
      {footer}
    </modal.Component>
  );
};
