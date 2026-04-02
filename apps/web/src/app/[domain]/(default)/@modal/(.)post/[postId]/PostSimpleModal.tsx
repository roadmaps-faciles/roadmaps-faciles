"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { SimpleModal, type SimpleModalProps } from "@/gouv/dsfr/layout/SimpleModal";

type SimpleEvent = Pick<Event, "preventDefault" | "target">;
export const PostSimpleModal = (props: SimpleModalProps) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(
    (e: SimpleEvent) => {
      if (e.target !== dialogRef.current) return;
      e.preventDefault();
      router.back();
    },
    [router],
  );

  useEffect(() => {
    const ref = dialogRef.current;
    ref?.addEventListener("click", handleClose);

    return () => {
      ref?.removeEventListener("click", handleClose);
    };
  }, [dialogRef, handleClose]);

  const getOnClickFn = useCallback(
    (props: { onClick?(e: SimpleEvent): void }, refresh?: boolean): SimpleModalProps.ActionAreaButtonProps["onClick"] =>
      e => {
        const ret = props?.onClick?.(e);
        handleClose(e);
        if (refresh) location.reload();
        return ret;
      },
    [handleClose],
  );

  const addClosabilityToButtons = useCallback(
    (buttonsProps: SimpleModalProps["buttons"]) => {
      const buttons = Array.isArray(buttonsProps) ? buttonsProps : [buttonsProps];
      return buttons.map(button => {
        if (!button) return button;
        if (button.canClosesModal || button.refresh) {
          return {
            ...button,
            ...("nativeButtonProps" in button
              ? {
                  nativeButtonProps: {
                    ...button.nativeButtonProps,
                    onClick: getOnClickFn(button.nativeButtonProps!, button.refresh),
                  },
                }
              : "linkProps" in button
                ? {
                    linkProps: {
                      ...button.linkProps,
                      onClick: getOnClickFn(button.linkProps!, button.refresh),
                    },
                  }
                : {}),
          };
        }
        return button;
      }) as SimpleModalProps["buttons"];
    },
    [getOnClickFn],
  );

  return (
    <SimpleModal
      {...props}
      ref={dialogRef}
      buttons={addClosabilityToButtons(props.buttons)}
      closeButtonProps={{
        ...props.closeButtonProps,
        nativeButtonProps: {
          ...props.closeButtonProps?.nativeButtonProps,
          onClick(e) {
            props.closeButtonProps?.nativeButtonProps?.onClick?.(e);
            router.back();
          },
        },
      }}
    />
  );
};
