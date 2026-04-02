import { DocsContainer as BaseContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import { useDarkMode } from "@vueless/storybook-dark-mode";
import { type PropsWithChildren, useEffect } from "react";
import { themes } from "storybook/theming";

/**
 * DocsContainer qui suit le dark mode via `storybook-dark-mode`.
 * Même pattern que react-dsfr : `useDarkMode()` lit le toggle depuis le channel
 * (pas de globals URL → pas de refresh), et on passe le thème au DocsContainer.
 */
export function DocsContainer({ children, ...props }: PropsWithChildren<DocsContainerProps>) {
  const isDark = useDarkMode();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <BaseContainer {...props} theme={isDark ? themes.dark : themes.light}>
      {children}
    </BaseContainer>
  );
}
