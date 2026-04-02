import { fr, type FrIconClassName, type RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { type ButtonProps } from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup, { type ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { type CSSProperties, forwardRef, memo, type PropsWithChildren, type ReactNode } from "react";

import styles from "./SimpleModal.module.scss";

export interface SimpleModalProps extends PropsWithChildren {
  buttons?:
    | [
        SimpleModalProps.ActionAreaButtonProps,
        SimpleModalProps.ActionAreaButtonProps,
        SimpleModalProps.ActionAreaButtonProps,
      ]
    | [SimpleModalProps.ActionAreaButtonProps, SimpleModalProps.ActionAreaButtonProps]
    | SimpleModalProps.ActionAreaButtonProps;
  buttonsEquisized?: boolean;
  className?: string;
  closeButtonProps?: ButtonProps.AsButton & ButtonProps.Common;
  iconId?: FrIconClassName | RiIconClassName;
  id: string;
  /** @default "medium" */
  size?: "large" | "medium" | "small";
  style?: CSSProperties;
  title?: ReactNode;
  topAnchor?: boolean;
}

export namespace SimpleModalProps {
  export type ActionAreaButtonProps = {
    /** @default false */
    canClosesModal?: boolean;
    refresh?: boolean;
  } & ButtonProps;
}

export const SimpleModal = memo(
  forwardRef<HTMLDialogElement, SimpleModalProps>(
    (
      {
        buttons: buttons_props,
        buttonsEquisized = false,
        children,
        className,
        closeButtonProps,
        iconId,
        id,
        size,
        style,
        title,
        topAnchor,
      },
      ref,
    ) => {
      const buttons = Array.isArray(buttons_props) ? buttons_props : buttons_props ? [buttons_props] : undefined;
      const titleId = `${id}-title`;
      return (
        <dialog
          aria-labelledby={titleId}
          id={id}
          className={cx(
            styles["fr-simple-modal"],
            styles["fr-simple-modal--opened"],
            fr.cx(topAnchor && "fr-modal--top"),
            className,
          )}
          style={style}
          ref={ref}
        >
          <div className={fr.cx("fr-container", "fr-container--fluid", "fr-container-md")}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
              <div
                className={(() => {
                  switch (size) {
                    case "large":
                      return fr.cx("fr-col-12", "fr-col-md-10", "fr-col-lg-8");
                    case "small":
                      return fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4");
                    case "medium":
                      return fr.cx("fr-col-12", "fr-col-md-8", "fr-col-lg-6");
                  }
                })()}
              >
                <div className={fr.cx("fr-modal__body")}>
                  <div className={fr.cx("fr-modal__header")}>
                    <Button
                      {...closeButtonProps}
                      className={fr.cx("fr-btn--close")}
                      title="Fermer"
                      aria-controls={id}
                      type="button"
                    >
                      Fermer
                    </Button>
                  </div>
                  <div className={fr.cx("fr-modal__content")}>
                    <h2 id={titleId} className={fr.cx("fr-modal__title")}>
                      {iconId !== undefined && <span className={fr.cx(iconId, "fr-fi--lg")} aria-hidden={true} />}
                      {title}
                    </h2>
                    {children}
                  </div>
                  {buttons !== undefined && (
                    <div className={fr.cx("fr-modal__footer")}>
                      <ButtonsGroup
                        alignment="right"
                        isReverseOrder
                        buttonsIconPosition="left"
                        inlineLayoutWhen="lg and up"
                        buttonsEquisized={buttonsEquisized}
                        buttons={
                          [...buttons].reverse().map(({ canClosesModal, refresh: _refresh, ...props }, i) => ({
                            ...props,
                            priority: (["primary", "secondary", "tertiary"] satisfies Array<ButtonProps["priority"]>)[
                              i
                            ],
                            ...(!canClosesModal
                              ? {}
                              : "linkProps" in props
                                ? {
                                    linkProps: {
                                      ...props.linkProps,
                                      "aria-controls": id,
                                    },
                                  }
                                : {
                                    nativeButtonProps: {
                                      ...props.nativeButtonProps,
                                      "aria-controls": id,
                                    },
                                  }),
                          })) as ButtonsGroupProps["buttons"]
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </dialog>
      );
    },
  ),
);
SimpleModal.displayName = "SimpleModal";
