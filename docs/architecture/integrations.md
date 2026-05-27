# Integration providers

Synchronisation bidirectionnelle entre les boards et des sources externes (GitHub, Notion). Code : `src/lib/ee/integration-provider/`.

## Architecture

Abstraction `IIntegrationProvider` + factory `createIntegrationProvider(type, config)`. Instanciation **par tenant** (pas singleton), chaque integration a son instance avec ses credentials déchiffrés.

### Encryption

AES-256-GCM avec scrypt key derivation dans `src/lib/ee/integration-provider/encryption.ts`. Clé via env var `INTEGRATION_ENCRYPTION_KEY`.

### Cron

`POST /api/ee/cron/integrations` (route handler) avec Bearer auth (env `INTEGRATION_CRON_SECRET`). Sert de catch-up safety net pour les providers qui supportent la réactive sync.

### Inbound posts readonly

Posts importés depuis une source externe sont readonly. Double guard :
- UI : `canEdit=false` / `canDelete=false` dans `PostPageHOP`
- Server actions : reject avec erreur i18n

Champ `Post.sourceLabel` affiche "imported from {integration}" ; readonly-guarded en UI + server.

### Server actions

`withIntegrationContext(role)` helper dans `actions.ts` centralise le boilerplate auth + feature + entitlement de toutes les actions d'integration.

## Notion

SDK v5.9.0. Utilise :
- `dataSources.query()` (pas `databases.query()`)
- Type guard `isFullDataSource`
- Search filter `"data_source"` (pas `"database"`)

## GitHub

Code dans `src/lib/ee/integration-provider/impl/github/`. Trois source types via l'interface `IGitHubSource` :
- Issues REST
- Discussions GraphQL
- Project v2 GraphQL

### Authentification

Dual mode :
- **App** : `@octokit/auth-app`, auto-refresh des tokens
- **PAT fallback** : token personnel quand l'App n'est pas configurée

Config dans `config.integrations.github.*` :
- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY` (base64)
- `GITHUB_APP_CLIENT_ID`
- `GITHUB_APP_CLIENT_SECRET`
- `GITHUB_APP_WEBHOOK_SECRET`
- `GITHUB_APP_NAME`

### Labels namespacés

`roadmaps-faciles:status:<name>`, `roadmaps-faciles:board:<name>`, `roadmaps-faciles:managed` créés automatiquement au setup. Pas utilisés en source Project (le Project v2 a son propre champ Status).

### Webhook

`POST /api/ee/integrations/github/webhook` :
- Vérification HMAC signature
- Détection bot via `sender.login === appName[bot]`
- Idempotence via `X-GitHub-Delivery`

### Anti-loop

Double protection contre les cycles webhook → outbound → webhook :
1. **Primaire** : bot sender check (skippe les events causés par l'App elle-même)
2. **Secondaire** : Redis lock `github-sync-lock:{postId}` TTL 30s

Le helper `notifyPostMutation` skippe également les posts dont le mapping a `metadata.direction === "inbound"` (évite les loops quand on applique un inbound change).

### Reactive sync

Quand le provider supporte webhooks + outbound hooks (GitHub App) :
- **Inbound** : webhook → `getInboundChange(remoteId)` → use case `ApplyInboundChange` (partagé avec full sync).
- **Outbound** : mutation post → `notifyPostMutation(postId, tenantUrl)` → `pushPostToGitHub` (fire-and-forget). Check du sync lock avant le push.

Le cron / manual sync devient un catch-up safety net.

`notifyPostMutation` est wiré dans `submitPost`, `updatePostContent`, `approvePost`.

### Remote stats sync

API unifiée `IIntegrationProvider.updateRemoteStats?(remoteId, stats, hints?)` ; `SyncIntegration` la préfère à l'API legacy `updateCommentsField` + `updateLikesField` quand disponible.

GitHub post une stats comment "pinned bot comment" avec marker `<!-- roadmaps-faciles:stats -->`. Le comment ID est caché dans `IntegrationMapping.metadata.statsCommentId` pour éviter de paginer tous les comments à chaque sync. Fallback : find-by-marker sur 404.

**Skippé en mode PAT** (anti-loop : les comments attribués au PAT pourraient déclencher des `issue_comment` webhook loops).

Inbound : `InboundChange.remoteStats` porte `commentCount` + `reactionCount`, persisté dans `IntegrationMapping.metadata.remoteStats`.

### GitHub pin endpoint

`PUT /repos/{owner}/{repo}/issues/comments/{comment_id}/pin` (PAS `POST`, voir `docs/gotchas.md`). Permission "Issues: Write" requise. Idempotent.

## Sync runs

`syncRunId` (UUID) groupe tous les logs d'un sync. Phase markers (`SKIPPED` + `message: "phase_marker"`) garantissent que `findSyncRuns` dérive la bonne direction même pour les phases vides.

### Conflict detection

Comparaison `post.updatedAt > mapping.lastSyncAt`. Conflits détectés stockés en status `CONFLICT`, résolus via use case `ResolveSyncConflict` (local = push outbound, remote = pull inbound).

### SSE progress

`/api/ee/integrations/[id]/sync` utilise `ReadableStream` + `TextEncoder` pour Server-Sent Events. Callback `onProgress` best-effort (swallows errors pour qu'une déconnexion client n'avorte pas le sync).

## Exposition UI publique

Ne **jamais** passer un `TenantIntegration` complet à la UI publique : contient `apiKey`, `installationId`, full config chiffrée.

Utiliser `findPublicMappingsForPosts(ids)` qui retourne des `PublicMappingSummary[]` (uniquement `integrationType`, `remoteUrl`, `metadata`). Les board pages sont publiques, et leak de config exposerait IDs internes + identifiant DB.

### RemoteStatsBadge

`src/components/Board/RemoteStatsBadge.tsx` : client component qui rend les stats. Lit `metadata.remoteStats` via type-guard helper. Ne rend **rien** quand pas de stats ET pas de remoteUrl (gère le cas Project source qui n'expose pas de stats).
