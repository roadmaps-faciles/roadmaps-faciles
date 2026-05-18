# Gotchas

Pièges connus et solutions dans le codebase Roadmaps Faciles.

## React / Next.js

- React 19 / Next.js 16: ne JAMAIS exporter `Context.Provider` directement (`export const Provider = MyContext.Provider`) — ça crash en RSC ("Received a promise that resolves to: Context"). Toujours wrapper dans un vrai composant client (`export const Provider = ({ children, value }) => <MyContext value={value}>{children}</MyContext>`)
- Next.js 16 `cacheComponents: true` is incompatible with route config exports (`dynamic`, `revalidate`, etc.) — use `await connection()` from `next/server` in pages instead
- Multi-tenant pages under `[domain]`: wrap children in `<Suspense>` + use `await connection()` to force dynamic rendering
- NextAuth `signIn()` uses `cookies().set()` internally — cannot be called during RSC render (read-only). Use a Server Action (form auto-submit pattern) instead
- Route Handlers: use `NextResponse.redirect()`, not `redirect()` from `next/navigation` (which throws and is for RSC/Server Actions only)
- Multi-tenant Route Handlers: never use `request.url` as base for root URLs — use `config.host` directly (request may reflect tenant domain)
- `DomainPageHOP` generic param is for route Params only, not page props — access `searchParams` via cast: `(props as unknown as { searchParams: Promise<...> }).searchParams`
- Next.js 16 uses `src/proxy.ts` (not `middleware.ts`) — correlation ID, rewrites, and request header injection all happen there
- Next.js `headers()` in `next.config.ts`: ALL matching rules are applied (not first-match). For duplicate header keys, the **last** matching entry in the array wins — put overrides AFTER the catch-all, not before
- `NODE_ENV` must NEVER be set in `.env` files or shell environment — Next.js manages it internally (`production` for build, `development` for dev). A stale `NODE_ENV=development` in the shell causes RSC prerender crashes during `next build` (React flight protocol gets `undefined` stack). The `build` script includes `unset NODE_ENV` as safety net
- Board pagination: `handleLoadMore` must compute `nextPage = page + 1` BEFORE fetching — fetching with current `page` then incrementing causes duplicate data on first load
- Zustand store `reset()` before `router.push()` causes UI flash (synchronous re-render before async navigation) — reset on mount with `useEffect` instead, and keep `submitting=true` on success path to prevent re-render
- Canonical redirect: `PLATFORM_DOMAIN` env var (e.g. `scalingo.io`) — proxy 301-redirects platform default domain to `NEXT_PUBLIC_SITE_URL`; skips `/api/` routes and review apps where rootDomain IS the platform domain; empty = disabled
- Playwright soft navigation: during Next.js client navigation, old + new DOM elements coexist briefly — use specific selectors (`name` filter) instead of generic ones (`level` only) for headings to avoid strict mode violations

## Prisma

- **NEVER use `prisma db push`** — it applies schema changes directly without creating a migration, causing drift between the migration history and the actual database. Always use `prisma migrate dev --name <name>` to create migrations. If you need to add enum values, create the migration SQL manually (`ALTER TYPE ... ADD VALUE`) and use `prisma migrate dev` to apply it. The only exception is `scripts/worktree-new.sh --db` which uses `db push` for ephemeral worktree DBs.
- `src/generated/` is gitignored (except `.gitattributes`) — run `pnpm prisma generate` if client is missing
- Prisma 7 enums are PascalCase (`IntegrationType`, `SyncDirection`, `SyncLogStatus`) — NOT SCREAMING_SNAKE (`INTEGRATION_TYPE`, `SYNC_DIRECTION`)
- Prisma JSON fields: `Record<string, unknown>` is not assignable to `Prisma.InputJsonValue` — use `as unknown as Prisma.InputJsonValue` explicit cast
- Prisma enum values: always use model constants (`POST_APPROVAL_STATUS.APPROVED`) instead of string literals (`"APPROVED"`) in queries and use cases
- Prisma `findMany` + `distinct` + `.length` loads all rows into memory — use `$queryRaw COUNT(DISTINCT ...)` for counting distinct values on large tables (audit log, etc.)

## DSFR / Dual-theme

- DSFR `fr-container--fluid` has `overflow: hidden` — override with `!overflow-visible` (Tailwind `!important`) when content needs to scroll/overflow
- DSFR `.fr-select-group:not(:last-child)` adds `margin-bottom: 1.5rem` — counter with `[&_.fr-select-group]:!mb-0` when using inline Select groups
- DSFR `Alert` with `small` prop requires `description` (even `description=""`) — TypeScript discriminated union requires it
- DSFR Card `desc` renders inside `<p>` — block-level children (`<div>`, `<form>`, `<h2>`) cause hydration errors. `UICardDsfr` has `hasComplexDescription` fallback rendering manual DSFR card HTML with `<div>` instead of `<p>` for desc
- Root error pages (`error.tsx`, `not-found.tsx`) are Default-only — root layout doesn't load DsfrShell/DSFR CSS, so these pages must use shadcn/Tailwind + UIButton bridges only
- DSFR JS (`fr-collapse`, `fr-nav` behaviors) doesn't attach to dynamically mounted React components — use React-managed state (useState + display toggle) instead of `fr-collapse` class for menus/collapses rendered after `startDsfr()`
- DSFR CSS loaded via `DsfrCssLoaderClient` (React.lazy) can override CSS modules — use `!important` on `content` rules in `Icon.module.scss` to win the specificity race
- Soft navigation from DSFR tenant pages to Default-only sections (admin, moderation) keeps DSFR stylesheets active — `DefaultThemeForcer` component disables them on mount, restores on unmount
- CSS module compound selectors: `:global([data-ui-theme="X"]).app` (no space) targets `<html>` only; `:global([data-ui-theme="X"]) .app` (space) is a descendant selector matching inner `.app` divs too — use compound for `<html>`-scoped theme styles in `root.module.scss`
- Dark mode persistence: root uses localStorage `"theme"` + `.dark` class on `<html>` (via ThemeScript). DSFR tenant pages additionally use localStorage `"scheme"` + `data-fr-scheme`/`data-fr-theme` attrs — both must be explicitly forced in Playwright/automation scripts
- Turbopack CSS isolation: `next/dynamic` in a server component eagerly bundles CSS (leaks). `React.lazy()` in a `"use client"` component defers CSS injection until the component actually renders. Always use `React.lazy()` + `<Suspense>` in client components to conditionally load CSS-heavy modules (DSFR, etc.)

## Config / Infra

- `config.rootDomain` includes the port (only strips protocol + `www.`) — domain/DNS providers must strip port with `.replace(/:\d+$/, "")` themselves
- DNS CNAME trailing dot: resolvers may return `"target.io."` — always normalize with `.replace(/\.$/, "")` before comparing
- Zod 4 is used (not v3) — API differs slightly; docs available via MCP: `https://mcp.inkeep.com/zod/mcp`
- Circular Zod schemas: use `z.lazy(() => Schema)` to avoid initialization errors
- OAuth env vars use `OAUTH_` prefix (`OAUTH_GITHUB_CLIENT_ID`, etc.) — only `src/config.ts` reads `process.env.*`, rest uses `config.oauth.*`
- `@auth/core` provider merge: `Nodemailer()` stores user config in `options` field; `parseProviders()` does `merge(defaults, userOptions)` which overrides top-level keys with `options.*` — the espace-membre-provider wrapper must flatten `options` into the base config (fixed in v0.3.3)
- `pino` and `pino-pretty` must be in `serverExternalPackages` in `next.config.ts` — Turbopack cannot bundle them
- `@sentry/nextjs` v10: use `webpack.autoInstrumentServerFunctions`, `webpack.treeshake.removeDebugLogging` (top-level equivalents are deprecated)
- Email templates (`src/emails/`): inline `style={{...}}` is required — email clients don't support external CSS/Tailwind; this is the exception to the "no inline styles" rule
- File upload MIME type: `file.type` from `FormData` is client-controlled — server validates against `ALLOWED_TYPES` set but does NOT check magic bytes. A `file-type` npm package could be added for magic bytes validation if stricter security is needed
- `tw-animate-css` is incompatible with Sass — Sass cannot parse Tailwind 4 `@utility`/`@property` directives. Import via a separate `.css` file (processed by PostCSS directly), not inside `.scss` files
- HTTP status codes: never utiliser de magic numbers (`{ status: 400 }`) — toujours `import { StatusCodes } from "http-status-codes"` et `{ status: StatusCodes.BAD_REQUEST }`. Le package est déjà installé et utilisé dans plusieurs route handlers
- GraphQL pagination in async generators: `const result = await octokit.graphql<{...}>()` inside a `while(shouldContinue)` loop causes TS7022 circular inference when destructuring fields that feed back into `shouldContinue`. Fix: extract the response type into a named interface and annotate explicitly (`const response: MyResponseType = await octokit.graphql(...)`)
- GitHub pin issue comment endpoint is `PUT /repos/{owner}/{repo}/issues/comments/{comment_id}/pin` (NOT `POST` — older docs and AI suggestions get this wrong). `POST` returns 404. App installation must have the "Issues: Write" permission. Idempotent: pinning an already-pinned comment returns 200 (or 422 in some cases — non-fatal, ignore).

## Tooling

- Workflow: always run `pnpm lint --fix` before manually fixing ESLint diagnostics (import sorting, formatting, etc.)
- ESLint 10: NOT yet compatible with `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` — stay on ESLint 9 until ecosystem catches up
- Vitest 4 browser provider: API changed from `provider: "playwright"` (string) to `provider: playwright()` (function import from `@vitest/browser-playwright`)
- Ne jamais utiliser le mcp github si possible, le binaire `gh`, quand disponible, fait largement le job et est plus rapide que les appels API du mcp (ex: `gh pr view <pr> --json body` pour récupérer la description d'une PR)
- Tracking provider `factory.ts` uses CJS `require()` to avoid pulling server code into client bundle — cannot be unit-tested with vitest ESM mocking; test providers directly instead
- Server tracking: always prefix `trackServerEvent()` with `void` — it returns `Promise<void>` and ESLint `no-floating-promises` will flag unhandled promises
- Tracking barrel `index.ts` is client-safe only — never import `getServerTrackingProvider` or `serverTracking` from it; use direct path imports for server code
- release-please: editing PR title/body doesn't change the release version — must edit files in the release branch (manifest `.release-please-manifest.json`, `package.json`); title mismatch causes "Duplicate release tag" errors
- GitHub Environment branch policies: tags must be explicitly allowed (e.g. pattern `v*`) for `release: published` deploys to work on production environment
- Out-of-scope bugs: when spotting bugs or issues outside the current feature scope, propose corrections rather than ignoring them
