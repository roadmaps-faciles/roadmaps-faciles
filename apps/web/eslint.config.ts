/**
 * ESLint config pour apps/web — étend la base partagée du monorepo.
 *
 * Ordre des configs (le dernier gagne en cas de conflit) :
 * 1. base       → règles partagées (import, prettier, TS, perfectionist)
 * 2. nextConfig → eslint-config-next (enregistre les plugins import, react, react-hooks, jsx-a11y, @next/next)
 * 3. app rules  → rules spécifiques à l'app Next.js (lodash, import resolution, react-hooks)
 * 4. overrides  → TS parser, Next.js files allowlist, scripts, tests
 *
 * Les plugins import/react viennent de nextConfig (pas de base) — voir root eslint.config.ts.
 */
import nextConfig from "eslint-config-next/core-web-vitals";
// @ts-expect-error — pas de types publiés pour ce plugin
import lodashPlugin from "eslint-plugin-lodash";

import { base } from "../../eslint.config";

const nextFiles = [
  "page",
  "head",
  "error",
  "template",
  "layout",
  "route",
  "loading",
  "opengraph-image",
  "twitter-image",
  "not-found",
  "forbidden",
  "unauthorized",
  "default",
  "icon",
  "apple-icon",
  "sitemap",
  "robots",
  "global-error",
  "middleware",
  "proxy",
].join("|");

const config = [
  // ─── Ignores globaux ──────────────────────────────────────────────────────
  {
    ignores: [
      "node_modules/**",
      "src/generated/**",
      "next-env.d.ts",
      ".next/**",
      ".source/**",
      "out/**",
      "dist/**",
      "coverage/**",
      "public/**",
      "prisma/**",
    ],
  },

  // ─── Base partagée ──────────────────────────────────────────────────────────
  ...base,

  // ─── Next.js (react, react-hooks, import, jsx-a11y, @next/next, parser TS) ─
  ...nextConfig,

  // ─── App-specific rules ─────────────────────────────────────────────────────
  // Rules propres à l'app Next.js, pas dans la base partagée :
  // - import resolution (no-unresolved, named, namespace, default) → nécessite eslint-import-resolver-typescript
  // - @next/next/* → spécifique Next.js
  // - react-hooks/* → fourni par nextConfig mais on force les niveaux ici
  // - lodash/import-scope → uniquement apps/web utilise lodash
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      lodash: lodashPlugin,
    },
    rules: {
      "import/no-unresolved": ["error", { commonjs: true }],
      "import/named": "error",
      "import/namespace": "error",
      "import/default": "error",

      "@next/next/no-html-link-for-pages": ["error", ["src/app", "src/pages"]],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "lodash/import-scope": ["error", "member"],
    },
  },

  // ─── TypeScript — project:true auto-découvre tsconfig.json, scripts/tsconfig.json, tests/tsconfig.json ─
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ─── Fichiers Next.js / configs — default export autorisé ────────────────
  {
    files: [
      "src/pages/**/*.ts",
      "src/pages/**/*.tsx",
      `src/app/**/+(${nextFiles}).ts`,
      `src/app/**/+(${nextFiles}).tsx`,
      "next.config.ts",
      "source.config.ts",
      "eslint.config.ts",
      "prisma.config.ts",
      "tailwind.config.ts",
      "vitest.config.ts",
      "vitest.config.db.ts",
      "playwright.config.ts",
      "next-sitemap.config.js",
      "postcss.config.js",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },

  // ─── Scripts — tsconfig séparé ────────────────────────────────────────────
  {
    files: ["scripts/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./scripts/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ─── Tests — tsconfig séparé + globals vitest ──────────────────────────────
  // Relaxe les règles @typescript-eslint/no-unsafe-* (les mocks et stubs sont loosely typed).
  {
    files: ["tests/**/*.ts", "vitest.setup.ts"],
    languageOptions: {
      globals: {
        afterAll: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        test: "readonly",
        vi: "readonly",
      },
      parserOptions: {
        project: "./tests/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
    },
  },
];

export default config;
