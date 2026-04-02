/**
 * Root ESLint config — monorepo shared rules.
 *
 * Architecture ESLint du monorepo :
 *
 * ```
 * eslint.config.ts (ce fichier)
 * ├── export base        → règles partagées (TS, prettier, import, perfectionist)
 * ├── export default     → config complète pour workspaces sans config locale
 * │                        (ex: packages/ui hérite automatiquement via ESLint walk-up)
 * │
 * apps/web/eslint.config.ts
 * └── import { base }    → base + nextConfig + lodash + overrides app-specific
 *
 * packages/ui/
 * └── (pas de config)    → ESLint remonte et utilise le default export ci-dessous
 * ```
 *
 * Contrainte clé : les plugins `import` et `react` ne sont PAS dans `base` car
 * `eslint-config-next` bundle ses propres instances. ESLint 9 interdit de redéfinir
 * un plugin avec une référence objet différente ("Cannot redefine plugin").
 * Solution : `base` déclare les rules import/react, mais seul le default export (ou
 * nextConfig côté web) enregistre les plugins.
 */
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

/** Options Prettier partagées — utilisées par le plugin ESLint prettier/prettier. */
export const prettierOptions = {
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 120,
  singleQuote: false,
  parser: "typescript",
  arrowParens: "avoid",
};

/**
 * Base ESLint config partagée entre tous les workspaces.
 *
 * Importée par les workspaces qui ont leur propre config (ex: apps/web) :
 * ```ts
 * import { base } from "../../eslint.config";
 * export default [...base, ...nextConfig, { rules: { ... } }];
 * ```
 *
 * Contient : js.recommended, typescript-eslint type-checked, prettier,
 * unused-imports, import rules, react rules, perfectionist.
 *
 * NE contient PAS les plugins `import` et `react` (voir JSDoc du fichier).
 * Les rules import/* et react/* fonctionnent car ESLint 9 flat config merge
 * les plugins de tout l'array — le consommateur doit les enregistrer.
 */
export const base = [
  // ─── Base JS ────────────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── @typescript-eslint / recommended-type-checked ───────────────────────────
  // [0] : parser + plugin registration (nécessaire pour les workspaces sans nextConfig)
  // [1] : règles scoped *.ts(x) par le package
  // [2] : règles sans scope → on en scope manuellement
  ...tseslint.configs.recommendedTypeChecked.slice(0, 2),
  { ...tseslint.configs.recommendedTypeChecked[2], files: ["**/*.ts", "**/*.tsx"] },

  // ─── Prettier : désactive les règles de formatting en conflit ───────────────
  prettierConfig,

  // ─── Plugins + règles communes ──────────────────────────────────────────────
  // Note: les plugins `import` et `react` ne sont PAS enregistrés ici pour éviter
  // "Cannot redefine plugin" quand apps/web spread `...base` + `...nextConfig`
  // (nextConfig bundle ses propres instances de ces plugins).
  // Le default export les enregistre pour les workspaces sans nextConfig (packages/ui).
  {
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "prettier/prettier": ["error", prettierOptions],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",
      "import/order": "off",
      "import/no-default-export": "error",
      "import/newline-after-import": "error",
      "import/no-useless-path-segments": "warn",
      "import/no-absolute-path": "warn",
      "import/no-named-as-default": "off",
      "import/consistent-type-specifier-style": ["error", "prefer-inline"],
      "import/no-duplicates": [
        "error",
        {
          "prefer-inline": true,
        },
      ],
      "import/export": "off",
      "import/no-extraneous-dependencies": "off",
      "import/no-internal-modules": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default"],
              message: 'Import "React" par défaut déjà géré par le bundler.',
            },
          ],
        },
      ],
      "react/no-unescaped-entities": [
        "error",
        {
          forbid: [">", "}"],
        },
      ],
    },
  },

  // ─── TypeScript-scoped rules ────────────────────────────────────────────────
  // Ces règles ne s'appliquent qu'aux fichiers .ts/.tsx.
  // `import/named: "off"` car TypeScript gère nativement la vérification des imports nommés.
  // apps/web le réactive ("error") car eslint-plugin-import avec resolver peut catcher des cas edge.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "import/named": "off",
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
        },
      ],
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            accessors: "no-public",
            constructors: "no-public",
          },
        },
      ],
      "@typescript-eslint/member-delimiter-style": [
        "off",
        {
          multiline: {
            delimiter: "none",
            requireLast: true,
          },
          singleline: {
            delimiter: "semi",
            requireLast: false,
          },
        },
      ],
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default"],
              message: 'Import "React" par défaut déjà géré par le bundler.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },

  // ─── Perfectionist ──────────────────────────────────────────────────────────
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": "error",
      "perfectionist/sort-exports": "error",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "perfectionist/sort-interfaces": "error",
      "perfectionist/sort-enums": "error",
      "perfectionist/sort-union-types": "warn",
      "perfectionist/sort-intersection-types": "warn",
    },
  },
];

/**
 * Default export — utilisé par les workspaces sans eslint.config.ts (héritage naturel).
 * Ex: packages/ui/ n'a pas de config → ESLint remonte et trouve celle-ci.
 */
export default [
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "apps/**",
      ".next/**",
      "dist/**",
      "out/**",
      "coverage/**",
      "**/storybook-static/**",
      ".agents/**",
    ],
  },

  // Enregistrement des plugins import + react — requis ici car `base` ne les inclut pas
  // (conflit "Cannot redefine plugin" avec nextConfig qui bundle ses propres instances).
  // Pour apps/web, c'est nextConfig qui les fournit ; ici on les fournit pour packages/*.
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  ...base,

  // TypeScript parser avec project:true — auto-découverte du tsconfig le plus proche.
  // Pour packages/ui/src/Button.tsx → trouve packages/ui/tsconfig.json.
  // tsconfigRootDir = monorepo root = limite haute de la recherche.
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // eslint.config.ts lui-même : pas de tsconfig qui l'inclut → désactiver toutes les rules type-checked
  // + autoriser le default export (obligatoire pour une config ESLint)
  {
    files: ["eslint.config.ts"],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "import/no-default-export": "off",
    },
  },

  // .github/scripts/*.js — CJS (module.exports) pour actions/github-script, pas de tsconfig
  {
    files: [".github/scripts/**/*.js"],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "import/no-default-export": "off",
    },
  },
  {
    files: [".github/scripts/**/*.js"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
      },
    },
  },

  // Stories, tests et configs : autorise le default export + relax des règles type-checked
  {
    files: [
      "**/*.stories.ts",
      "**/*.stories.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/.storybook/**/*.ts",
      "**/.storybook/**/*.tsx",
      "**/vitest.config.ts",
      "**/vitest.config.*.ts",
      "**/vitest.setup.ts",
      "**/postcss.config.js",
    ],
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },

  ...storybook.configs["flat/recommended"],
];
