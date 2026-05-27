import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

import { base } from "../../eslint.config.ts";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "src/generated/**"],
  },

  // Register import plugin (no React needed - server-only app)
  {
    plugins: {
      import: importPlugin,
    },
  },

  ...base,

  // TypeScript parser with project discovery
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Config files + scripts: allow default exports, disable type-checked rules
  {
    files: ["eslint.config.ts", "vitest.config.ts", "prisma.config.ts", "scripts/**/*.ts"],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "import/no-default-export": "off",
    },
  },

  // Test files: relax rules (Hono res.json() returns `any`)
  {
    files: ["**/*.test.ts"],
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // Disable react rules (no React in this app)
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
