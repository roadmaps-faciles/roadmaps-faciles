import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import { Box, type BoxProps } from "@/gouv/dsfr";

export type ContainerProps = (
  | ({
      fluid: true;
    } & BoxProps)
  | ({
      fluid?: never;
    } & Omit<BoxProps, "ml" | "mr" | "mx" | "pl" | "pr" | "px">)
) & {
  size?: "lg" | "md" | "sm" | "xl";
};

export const Container = ({ children, className, fluid, size, ...rest }: ContainerProps) => {
  let containerClass = "fr-container";
  if (size) containerClass += `-${size}`;
  if (fluid) containerClass += `--fluid`;
  return (
    <Box className={cx(className, containerClass)} {...rest}>
      {children}
    </Box>
  );
};
