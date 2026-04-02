import { Children, isValidElement, type PropsWithChildren, type ReactNode } from "react";

/**
 * Retrieves the label from the children of a React component.
 */
export const getLabelFromChildren = (children: ReactNode) => {
  let label = "";

  Children.map(children, child => {
    if (typeof child === "string") {
      label += child;
    } else if (isValidElement<PropsWithChildren>(child) && child.props.children) {
      label += getLabelFromChildren(child.props.children);
    }
  });

  return label;
};
