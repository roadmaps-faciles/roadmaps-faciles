import { fr } from "@codegouvfr/react-dsfr";
import { cx, type CxArg } from "@codegouvfr/react-dsfr/tools/cx";
import { isValidElement, type JSX, type PropsWithChildren, type ReactNode, useId } from "react";

import { type PropsWithoutChildren } from "@/utils/types";

import { Box } from "./Box";

export type FormFieldsetProps = {
  className?: CxArg;
  elements: Array<FormFieldsetElementProps | ReactNode>;
  error?: ReactNode;
  hint?: ReactNode;
  legend: ReactNode;
  legentRegular?: boolean;
  nativeFieldsetProps?: PropsWithoutChildren<JSX.IntrinsicElements["fieldset"]>;
  valid?: ReactNode;
};

export type FormFieldsetElementProps = {
  children: ReactNode;
  className?: CxArg;
  inline?: "grow" | boolean;
  type?: "number" | "postal" | "year";
};

export const FormFieldset = ({
  hint,
  legend,
  elements,
  error,
  valid,
  legentRegular,
  className,
  nativeFieldsetProps,
}: FormFieldsetProps) => {
  const id = useId();
  const hasAssert = !!error || !!valid;
  const assertMessageId = `fr-fieldset-${id}-${error ? "error" : "valid"}`;

  return (
    <fieldset
      {...nativeFieldsetProps}
      role="group"
      className={cx(fr.cx("fr-fieldset", !!error && "fr-fieldset--error", !!valid && "fr-fieldset--valid"), className)}
      aria-labelledby={cx(`fr-fieldset-${id}-legend`, hasAssert && assertMessageId)}
    >
      <legend
        className={fr.cx("fr-fieldset__legend", legentRegular && "fr-fieldset__legend--regular")}
        id={`fr-fieldset-${id}-legend`}
      >
        {legend}
        {hint && <span className="fr-hint-text">{hint}</span>}
      </legend>
      {elements.map((element, index) => {
        if (isValidElement(element)) {
          return (
            <Box key={`fieldset__element-${index}`} className="fr-fieldset__element">
              {element}
            </Box>
          );
        }

        const props = element as FormFieldsetElementProps;
        return (
          <Box
            key={`fieldset__element-${index}`}
            className={cx(
              "fr-fieldset__element",
              fr.cx(
                {
                  "fr-fieldset__element--inline": !!props.inline,
                  "fr-fieldset__element--inline-grow": props.inline === "grow",
                },
                props.type && `fr-fieldset__element--${props.type}`,
              ),
              props.className,
            )}
          >
            {props.children}
          </Box>
        );
      })}
      {hasAssert && (
        <FormFieldsetMessageGroup id={assertMessageId} isValid={!!valid}>
          {error ?? valid}
        </FormFieldsetMessageGroup>
      )}
    </fieldset>
  );
};

interface FormFieldsetMessageGroupProps {
  id: string;
  isValid: boolean;
}
const FormFieldsetMessageGroup = ({ id, isValid, children }: PropsWithChildren<FormFieldsetMessageGroupProps>) => (
  <div className="fr-messages-group" id={id} aria-live="assertive">
    <p className={cx("fr-message", isValid ? "fr-message--valid" : "fr-message--error")}>{children}</p>
  </div>
);
