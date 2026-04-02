import { type Preview } from "@storybook/react-vite";
import { useDarkMode } from "@vueless/storybook-dark-mode";
import { useEffect } from "react";
import { themes } from "storybook/theming";

import { DocsContainer } from "./DocsContainer";
import "./storybook.css";

/**
 * Les tokens CSS utilisent `.dark[data-ui-theme="Default"]` (compound selector).
 * Les composants Radix utilisent des Portals (Dialog, Sheet, Popover, Select, etc.)
 * qui rendent dans `document.body`, en dehors de tout wrapper React.
 *
 * On applique `data-ui-theme` et `.dark` sur `<html>` pour que les portals
 * héritent des tokens. `storybook-dark-mode` toggle via channel (pas de globals URL),
 * `useDarkMode()` dans le decorator sync `.dark` sur `<html>`.
 */
const preview: Preview = {
  tags: ["autodocs", "a11y-test"],
  decorators: [
    Story => {
      const isDark = useDarkMode();

      useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }, [isDark]);

      return <Story />;
    },
  ],
  parameters: {
    darkMode: {
      dark: themes.dark,
      light: themes.light,
      stylePreview: true,
    },

    docs: {
      container: DocsContainer,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
