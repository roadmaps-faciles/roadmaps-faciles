# Providers : storage, DNS, domain, email, markdown editor

Toutes les abstractions "provider" suivent le même pattern : interface + factory + impls.

## Domain providers

Code : `src/lib/ee/domain-provider/`. Interface `IDomainProvider` + factory `getDomainProvider()`. Impls : `noop`, `scalingo`, `scalingo-wildcard`, `clevercloud`, `caddy`.

Gotcha : `config.rootDomain` inclut le port (le strip ne fait que protocol + `www.`), les domain/DNS providers doivent strip le port eux-mêmes avec `.replace(/:\d+$/, "")`.

## DNS providers

Code : `src/lib/ee/dns-provider/`. Interface `IDnsProvider` + factory `getDnsProvider()`. Impls : `noop`, `manual`, `ovh`, `cloudflare`.

### Zone-relative subdomain

Quand la zone DNS diffère du `rootDomain` (cas des sous-domaines imbriqués), l'env var `DNS_ZONE_NAME` indique la zone. `computeDnsNames()` dans `src/lib/ee/dns-provider/dnsUtils.ts` calcule le sous-domaine relatif à la zone.

### Erreurs non-bloquantes

Les erreurs DNS sont **non-bloquantes** dans les use cases (try/catch + `logger.warn`). Un tenant peut être créé même si le DNS provisioning échoue : un admin peut retry plus tard.

`CreateNewTenantOutput` est `{ tenant: TenantWithSettings, dns?: DnsProvisionResult }`. Accéder à `result.tenant.id` (pas `result.id`).

## Storage providers

Code : `src/lib/ee/storage-provider/`. Interface `IStorageProvider` + factory `getStorageProvider()`. Impls : `noop`, `s3`.

Config dans `config.storageProvider` : `STORAGE_PROVIDER`, `STORAGE_S3_*`.

### S3 impl

`@aws-sdk/client-s3`. `PutObject` / `DeleteObject`. `forcePathStyle: true` pour la compatibilité MinIO.

### Upload

`uploadImage()` server action dans `src/app/[domain]/(domain)/upload-image.ts`. Auth + tenant-scoped, validation file type / size, audit trail.

### Key structure

`tenants/{tenantId}/images/{uuid}.{ext}`. Images servies depuis l'URL publique S3.

### Key prefix multi-env

`STORAGE_S3_KEY_PREFIX` (défaut vide) est prepended de manière transparente à upload / delete / URL côté provider. Les keys logiques en DB restent inchangées entre envs. Utilisé pour les review apps Coolify (prefix `pr-<n>/`) qui mutualisent un seul bucket S3.

### CSP

`img-src` dans `next.config.ts` inclut dynamiquement le host de `STORAGE_S3_PUBLIC_URL`.

## Markdown editor

Composant `MarkdownEditor` dans `src/gouv/dsfr/base/client/MarkdownEditor.tsx`.

### Toolbar

bold, italic, heading, list, ordered list, quote, code, link, image upload.

### Shortcuts

Ctrl+B (bold), Ctrl+I (italic).

### Preview

`reactMarkdownPreviewConfig` dans `src/lib/utils/react-markdown.tsx` (rendu paragraphes complet).

### Image upload

drag & drop, clipboard paste, file picker → `uploadImage()` server action → insertion `![alt](url)`.

Utilisé dans `SubmitPostForm` et `PostEditForm` ; remplace les `<Input textArea>` plain.

### Emoji autocomplete

`@github/text-expander-element` : doit être **dynamiquement importé** dans `useEffect` (`customElements.define()` au module scope requiert `HTMLElement`, indisponible pendant le SSR).

Gotcha `node-emoji.search()` : passe la query à `new RegExp()`. Les special chars (`+`, `*`, `?`, etc.) crash. Toujours wrapper dans try/catch.

## Email

react-email templates (`src/emails/`) + Nodemailer (`src/lib/mailer.ts` expose `sendEmail()`, maildev en dev).

### Theme-aware

Les emails rendent en layout Default ou DSFR selon le prop `theme?: UiTheme` (défaut `"Default"`).

`src/emails/themed.tsx` : `getEmailKit(theme)` retourne Layout / Button / Text / Heading / Spacer pour le thème demandé.

- **DSFR** : `DsfrEmailLayout` (`src/emails/gouv/`) + `DsfrButton`, `DsfrText`, `DsfrHeading`, `DsfrSpacer` (`src/emails/components.tsx`).
- **Default** : `DefaultEmailLayout` (`src/emails/default/`) + `DefaultButton`, `DefaultText`, `DefaultHeading`, `DefaultSpacer`. French Blue `#163C90`, logo `roadmaps-faciles.png`.

### Render facade

`src/emails/renderEmails.ts` expose `renderXxxEmail()`. Utilise `createElement()` (pas JSX) parce que Rolldown ne peut pas parser `.tsx` dans le graphe d'import vitest. Voir `docs/gotchas.md` section Tooling.

### Callers

- Root emails → Default (implicite).
- Tenant emails → `settings.uiTheme`.
- Magic link → résolu depuis le host header.

### i18n

`getEmailTranslations()` dans `src/emails/getEmailTranslations.ts` : standalone, charge les JSON directement, **pas** de dépendance au server context next-intl.

### Inline styles

Les templates emails utilisent `style={{...}}` inline : exception à la règle "no inline styles" du projet. Les clients mail ne supportent pas le CSS externe / Tailwind.

## Caching

Redis via ioredis + unstorage.
