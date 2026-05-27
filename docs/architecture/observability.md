# Observability & Tracking

Trois piliers : Pino pour le logging structuré, Sentry pour l'error tracking + tracing, PostHog (ou Matomo) pour l'analytics produit.

## Logging

- Logger singleton `src/lib/logger.ts`, marqué `server-only`. `pino-pretty` en dev, JSON en prod.
- `pino` et `pino-pretty` doivent rester dans `serverExternalPackages` du `next.config.ts` (Turbopack ne sait pas les bundler, voir `docs/gotchas.md`).
- Server-side : remplacer tout `console.*` par le logger. Client-side : `console.error` reste OK, Sentry capture automatiquement.
- Request logger : `createRequestLogger(reqCtx)` dans `src/lib/utils/requestLogger.ts` retourne un child logger avec `correlationId`.
- Correlation ID : généré dans `src/proxy.ts`, propagé via `x-correlation-id` (request + response).

## Sentry

- Activé uniquement quand `SENTRY_DSN` est défini, sinon disabled à zéro coût.
- Source maps uploadées uniquement en prod/staging (check `APP_ENV` dans `next.config.ts`).
- Environment depuis `NEXT_PUBLIC_APP_ENV`, release depuis `NEXT_PUBLIC_APP_VERSION`. Sampling : prod 0.1, staging 0.5, dev 1.0.
- `beforeSend` filtre le bruit (ResizeObserver, extensions, CORS).
- Cross-integration PostHog : session ID et distinct ID exposés comme tags Sentry.
- Scope enrichi par `enrichSentryScope(reqCtx)` dans `src/lib/utils/sentry.ts` (injecte correlation ID + IP comme tags).

## Health check

`/api/healthz` retourne JSON, check DB + Redis, status 200 ou 503.

## Tracking (ee)

Provider abstraction dans `src/lib/ee/tracking-provider/`, factory `getTrackingProvider()`. Trois providers :

- `noop` : défaut dev, ne fait rien.
- `matomo` : page views uniquement.
- `posthog` : full tracking + feature flags.

Config via env :
- `NEXT_PUBLIC_TRACKING_PROVIDER` (`noop` / `matomo` / `posthog`)
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` (défaut `https://eu.i.posthog.com`)

PostHog : host EU, pas de session replay (`disable_session_recording: true`), feature flags prêts (`useFeatureFlags()`). PostHog a deux projets séparés preprod + prod ; Sentry a un seul projet avec distinction par tag `environment`.

### Client vs server

- Client : `useTracking()` depuis `TrackingContext.tsx`, `<TrackPageView event={...} />` pour les vues.
- Server : `void trackServerEvent(distinctId, event)` depuis `@/lib/ee/tracking-provider/serverTracking`. Fire-and-forget comme `audit()`. **Toujours préfixer par `void`** (sinon ESLint `no-floating-promises`).
- Import server : `import { trackServerEvent } from "@/lib/ee/tracking-provider/serverTracking"`. **Jamais** depuis le barrel `index.ts` (client-safe only).
- Identity sync : `IdentifyUser.tsx` (client) synchronise NextAuth session vers Sentry user context + tracking provider identify/group.

### Tracking plan

`src/lib/ee/tracking-provider/trackingPlan.ts` : 25 events typés, organisés AARRI (Acquisition → Activation → Engagement → Retention → Referral → Impact).

Ajouter un event :
1. Définir la factory dans `trackingPlan.ts`
2. Ajouter à `TRACKING_EVENTS`
3. Wire dans la server action via `void trackServerEvent()` ou dans une page via `<TrackPageView>`
4. Bumper le compteur dans cette doc + le commentaire JSDoc header de `trackingPlan.ts`

Convention de nom : `entity.past_tense_verb` (`post.created`, `vote.cast`).

### Events auth tracking

- `user.signed_up`, `user.first_login`, `user.signed_in` : émis dans le NextAuth jwt callback.
- `invitation.accepted` : émis dans le signIn callback.
- `post.first_created` / `vote.first_cast` : utilisent un fire-and-forget count check (`prisma.post.count().then(...)`) après la création.

### Consent

DSFR consent banner avec finalités conditionnelles par provider dans `src/consentManagement.tsx`.

## Gotchas observability

Voir `docs/gotchas.md` section "Tooling" et "Config / Infra" pour les pièges spécifiques (factory `require()` non testable, tracking barrel client-safe only, etc.).
