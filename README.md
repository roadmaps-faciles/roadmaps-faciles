# Roadmaps Faciles

<img src="./apps/web/public/img/roadmaps-faciles.png" alt="Roadmaps Faciles" width="120" align="left" />

**Roadmaps Faciles** permet de regrouper les avis et retours des usagers pour orienter efficacement la feuille de route de votre produit et améliorer votre **impact**.

Le projet accueille les contributions — merci 💚

---

## 🧱 Stack & décisions clés

- **Framework** : Next.js 16 (App Router, Server Actions)
- **Langage** : TypeScript strict  
- **Auth** : NextAuth v5 (password argon2, magic link, OAuth, bridge SSO cross-domaine)
- **ORM** : Prisma (IDs en `uuid`, modèles multi-tenant)  
- **Validation** : Zod **v4** (schémas dans `lib/model`)  
- **UI** : Theme switching tenant-level — DSFR (Design System de l’État) pour les collectivités publiques, shadcn/ui + palette French Blue (oklch) pour les autres. Tailwind CSS 4 + SCSS modules
- **Multi-tenant** : sous-domaines, contenu servi selon le tenant (rewrite); domaines customs possibles
- **Licensing** : Hono (serveur de licences dédié, Ed25519, Stripe)

Ces choix sont détaillés dans les ADR (Architecture Decision Records) / `docs/adr` et DDR (Design Decision Records) / `docs/ddr`.

---

## 🚀 Démarrer

> [!NOTE] 
> **Prérequis**
> - Node.js ≥ 24 (recommandé : activer Corepack) (cf. `.nvmrc`)
> - PostgreSQL ≥ 15 (local ou conteneur via docker-compose)  

### Installation

```bash
# Cloner
git clone https://github.com/roadmaps-faciles/roadmaps-faciles.git
cd roadmaps-faciles

# Installer deps
pnpm install
```

### docker-compose (optionnel)

PostgreSQL (DBs: `roadmaps-faciles` + `licensing`), Redis, Maildev et MinIO (stockage S3 local).

```bash
# Démarrer PostgreSQL et Maildev
docker-compose up -d
```


### Variables d'environnement

Créer `.env.development.local` à partir de `.env.development` et renseigner si besoin.

> [!TIP]
> Toutes les variables ont des valeurs par défaut dans le code (`src/config.ts`). Seules celles marquées **obligatoire** doivent être renseignées pour un fonctionnement minimal.

#### Global

| Variable | Description | Défaut |
|---|---|---|
| `APP_ENV` | Environnement applicatif (`dev`, `prod`, `review`, `staging`) | `dev` |
| `MAINTENANCE_MODE` | Active le mode maintenance | `false` |
| `PLATFORM_DOMAIN` | Domaine de la plateforme d'hébergement (ex: `scalingo.io`) — redirige les requêtes vers `NEXT_PUBLIC_SITE_URL` | — |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site principal | `http://localhost:3000` |
| `NEXT_PUBLIC_REPOSITORY_URL` | URL du dépôt Git | `https://github.com/roadmaps-faciles/roadmaps-faciles` |
| `NEXT_PUBLIC_APP_VERSION` | Version affichée (auto en CI) | `dev` |
| `NEXT_PUBLIC_APP_VERSION_COMMIT` | Commit de la version (auto en CI) | `unknown` |
| `ADMINS` | Usernames des admins root, séparés par virgule | `lilian.sagetlethias,julien.bouquillon` |
| `DATABASE_URL` | **Obligatoire.** URL de connexion PostgreSQL | — |

#### Auth / Espace Membre

| Variable | Description | Défaut |
|---|---|---|
| `AUTH_TRUST_HOST` | Faire confiance au host pour NextAuth | `1` |
| `AUTH_URL` | URL de l'endpoint NextAuth (auto-détecté) | — |
| `SECURITY_JWT_SECRET` | **Obligatoire en prod.** Secret JWT pour les sessions | `secret` |
| `SECURITY_WEBHOOK_SECRET` | **Obligatoire en prod.** Secret pour les webhooks | `secret` |
| `ESPACE_MEMBRE_API_KEY` | Clé API Espace Membre (optionnel) | — |
| `ESPACE_MEMBRE_URL` | URL de l'Espace Membre | `https://espace-membre.incubateur.net` |

#### OAuth (SSO par tenant)

Fournisseurs d'authentification OAuth, activables par tenant. Laisser vide pour désactiver.

| Variable | Description | Défaut |
|---|---|---|
| `OAUTH_GITHUB_CLIENT_ID` | Client ID GitHub OAuth | — |
| `OAUTH_GITHUB_CLIENT_SECRET` | Client Secret GitHub OAuth | — |
| `OAUTH_GOOGLE_CLIENT_ID` | Client ID Google OAuth | — |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth | — |
| `OAUTH_PROCONNECT_CLIENT_ID` | Client ID ProConnect (OIDC) | — |
| `OAUTH_PROCONNECT_CLIENT_SECRET` | Client Secret ProConnect | — |
| `OAUTH_PROCONNECT_ISSUER` | URL de l'issuer ProConnect | — |

#### Brand (DSFR)

| Variable | Description | Défaut |
|---|---|---|
| `NEXT_PUBLIC_BRAND_NAME` | Nom de la marque | `Roadmaps Faciles` |
| `NEXT_PUBLIC_BRAND_TAGLINE` | Tagline | `Créez vos roadmaps en quelques clics` |
| `NEXT_PUBLIC_BRAND_MINISTRY` | Intitulé du ministère (DSFR header) | `République\nFrançaise` |
| `NEXT_PUBLIC_BRAND_OPERATOR_ENABLE` | Afficher le logo opérateur | `true` |
| `NEXT_PUBLIC_BRAND_OPERATOR_LOGO_URL` | URL du logo opérateur | `/img/roadmaps-faciles.png` |
| `NEXT_PUBLIC_BRAND_OPERATOR_LOGO_ALT` | Alt du logo opérateur | `Roadmaps Faciles` |
| `NEXT_PUBLIC_BRAND_OPERATOR_LOGO_ORIENTATION` | Orientation du logo (`horizontal`, `vertical`) | `vertical` |

#### Mentions légales

Pages légales personnalisables pour le self-hosting.

| Variable | Description | Défaut |
|---|---|---|
| `NEXT_PUBLIC_LEGAL_PUBLISHER_NAME` | Nom de l'éditeur du site | `Roadmaps Faciles` |
| `NEXT_PUBLIC_LEGAL_PUBLISHER_ADDRESS` | Adresse de l'éditeur | — |
| `NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR` | Directeur de la publication | `Le responsable légal de Roadmaps Faciles` |
| `NEXT_PUBLIC_LEGAL_HOSTING_NAME` | Nom de l'hébergeur | `Scalingo SAS` |
| `NEXT_PUBLIC_LEGAL_HOSTING_ADDRESS` | Adresse de l'hébergeur | `15 avenue du Rhin, 67100 Strasbourg, France` |
| `NEXT_PUBLIC_LEGAL_HOSTING_CONTACT` | Email de contact de l'hébergeur | `support@scalingo.com` |
| `NEXT_PUBLIC_LEGAL_HOSTING_PRIVACY_URL` | Lien vers la politique de confidentialité de l'hébergeur | *(Scalingo)* |
| `NEXT_PUBLIC_LEGAL_CONTACT_EMAIL` | Email de contact général | `contact@roadmaps-faciles.fr` |
| `NEXT_PUBLIC_LEGAL_RGPD_EMAIL` | Email DPO / exercice des droits RGPD | `rgpd@roadmaps-faciles.fr` |

#### Mailer

| Variable | Description | Défaut |
|---|---|---|
| `MAILER_SMTP_HOST` | Hôte SMTP | `127.0.0.1` |
| `MAILER_SMTP_PORT` | Port SMTP | `1025` |
| `MAILER_SMTP_LOGIN` | Login SMTP | — |
| `MAILER_SMTP_PASSWORD` | Mot de passe SMTP | — |
| `MAILER_SMTP_SSL` | Activer TLS | `false` |
| `MAILER_FROM_EMAIL` | Adresse expéditeur | `Roadmaps <noreply@roadmaps-faciles.fr>` |

#### Redis

| Variable | Description | Défaut |
|---|---|---|
| `REDIS_URL` | URL de connexion Redis (prioritaire si définie) | — |
| `REDIS_HOST` | Hôte Redis | `localhost` |
| `REDIS_PORT` | Port Redis | `6379` |
| `REDIS_PASSWORD` | Mot de passe Redis | — |
| `REDIS_TLS` | Activer TLS | `false` |
| `REDIS_BASE` | Préfixe des clés Redis | `roadmaps-faciles` |

#### Matomo

| Variable | Description | Défaut |
|---|---|---|
| `NEXT_PUBLIC_MATOMO_URL` | URL de l'instance Matomo | — |
| `NEXT_PUBLIC_MATOMO_SITE_ID` | ID du site Matomo | — |

#### Tracking (analytics)

| Variable | Description | Défaut |
|---|---|---|
| `NEXT_PUBLIC_TRACKING_PROVIDER` | Provider de tracking (`noop`, `matomo`, `posthog`) | `noop` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Clé projet PostHog | — |
| `NEXT_PUBLIC_POSTHOG_HOST` | Hôte PostHog | `https://eu.i.posthog.com` |

#### Domain Provider

Gestion des domaines custom sur la plateforme d'hébergement. Voir `docs/deploy/caddy/README.md` pour le détail des déploiements.

| Variable | Description | Défaut |
|---|---|---|
| `DOMAIN_PROVIDER` | Provider de domaines (`noop`, `scalingo`, `scalingo-wildcard`, `clevercloud`, `caddy`) | `noop` |

<details>
<summary>Variables Scalingo</summary>

| Variable | Description | Défaut |
|---|---|---|
| `DOMAIN_SCALINGO_API_TOKEN` | Token API Scalingo | — |
| `DOMAIN_SCALINGO_API_URL` | URL de l'API Scalingo | `https://api.osc-fr1.scalingo.com` |
| `DOMAIN_SCALINGO_APP_ID` | ID de l'app Scalingo | — |

</details>

<details>
<summary>Variables Clever Cloud</summary>

| Variable | Description | Défaut |
|---|---|---|
| `DOMAIN_CLEVERCLOUD_CONSUMER_KEY` | OAuth consumer key | — |
| `DOMAIN_CLEVERCLOUD_CONSUMER_SECRET` | OAuth consumer secret | — |
| `DOMAIN_CLEVERCLOUD_TOKEN` | OAuth token | — |
| `DOMAIN_CLEVERCLOUD_TOKEN_SECRET` | OAuth token secret | — |
| `DOMAIN_CLEVERCLOUD_APP_ID` | ID de l'app Clever Cloud | — |

</details>

<details>
<summary>Variables Caddy</summary>

| Variable | Description | Défaut |
|---|---|---|
| `DOMAIN_CADDY_ADMIN_URL` | URL de l'API admin Caddy (health check) | `http://localhost:2019` |
| `DOMAIN_CADDY_ASK_URL` | URL de l'endpoint de validation on-demand TLS | — |
| `DOMAIN_CADDY_UPSTREAM` | Adresse de l'app Next.js (reverse proxy) | — |

</details>

#### Storage Provider (upload d'images)

Stockage S3-compatible pour les images uploadées dans les posts (drag & drop, presse-papier).

| Variable | Description | Défaut |
|---|---|---|
| `STORAGE_PROVIDER` | Provider de stockage (`noop`, `s3`) | `noop` |
| `STORAGE_MAX_FILE_SIZE_MB` | Taille max d'un fichier uploadé (Mo) | `5` |
| `STORAGE_S3_ENDPOINT` | Endpoint S3 (ex: `http://localhost:9000` pour MinIO) | — |
| `STORAGE_S3_REGION` | Région S3 | `us-east-1` |
| `STORAGE_S3_BUCKET` | Nom du bucket | — |
| `STORAGE_S3_ACCESS_KEY_ID` | Access Key ID | — |
| `STORAGE_S3_SECRET_ACCESS_KEY` | Secret Access Key | — |
| `STORAGE_S3_PUBLIC_URL` | URL publique du bucket (ex: `http://localhost:9000/roadmaps-faciles`) | — |

#### DNS Provider

Gestion automatique des enregistrements DNS pour les sous-domaines.

| Variable | Description | Défaut |
|---|---|---|
| `DNS_PROVIDER` | Provider DNS (`noop`, `manual`, `ovh`, `cloudflare`) | `noop` |
| `DNS_ZONE_NAME` | Zone DNS si différente du rootDomain (sous-domaines imbriqués) | *(rootDomain)* |
| `DNS_PROVIDER_TARGET` | Cible CNAME pour les enregistrements DNS | — |

<details>
<summary>Variables OVH</summary>

| Variable | Description | Défaut |
|---|---|---|
| `DNS_OVH_ENDPOINT` | Endpoint OVH (`ovh-eu`, `ovh-ca`) | `ovh-eu` |
| `DNS_OVH_APPLICATION_KEY` | Application key OVH | — |
| `DNS_OVH_APPLICATION_SECRET` | Application secret OVH | — |
| `DNS_OVH_CONSUMER_KEY` | Consumer key OVH | — |

</details>

<details>
<summary>Variables Cloudflare</summary>

| Variable | Description | Défaut |
|---|---|---|
| `DNS_CLOUDFLARE_EMAIL` | Email du compte Cloudflare | — |
| `DNS_CLOUDFLARE_API_KEY` | Clé API Cloudflare | — |

</details>

#### Observabilité

Logging structuré (Pino) et error tracking (Sentry) optionnel. Voir `docs/adr/0015-observability.md`.

| Variable | Description | Défaut |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry client (vide = Sentry désactivé) | — |
| `SENTRY_DSN` | DSN Sentry server (fallback sur `NEXT_PUBLIC_SENTRY_DSN`) | — |
| `SENTRY_AUTH_TOKEN` | Token pour upload des source maps en CI | — |
| `SENTRY_ORG` | Organisation Sentry | — |
| `SENTRY_PROJECT` | Projet Sentry | — |
| `LOG_LEVEL` | Niveau de log Pino (`trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`) | `debug` |

#### Intégrations tierces (Notion)

Variables pour le framework d'intégrations tierces (connecteur Notion). Voir `docs/adr/` pour les décisions architecturales.

| Variable | Description | Défaut |
|---|---|---|
| `INTEGRATION_ENCRYPTION_KEY` | **Obligatoire en prod.** Clé de chiffrement AES-256-GCM pour les clés API des intégrations (≥ 32 caractères) | — |
| `INTEGRATION_CRON_MANAGER` | Type de cron manager (`noop`, `route`) | `noop` |
| `INTEGRATION_CRON_SECRET` | Secret Bearer pour le endpoint cron `/api/ee/cron/integrations` | — |
| `GITHUB_APP_ID` | ID de la GitHub App (mode App, optionnel — sans = PAT uniquement) | — |
| `GITHUB_APP_PRIVATE_KEY` | Clé privée PEM de la GitHub App, encodée en base64 | — |
| `GITHUB_APP_CLIENT_ID` | Client ID OAuth de la GitHub App | — |
| `GITHUB_APP_CLIENT_SECRET` | Client secret OAuth de la GitHub App | — |
| `GITHUB_APP_WEBHOOK_SECRET` | Secret pour vérifier les signatures webhook GitHub | — |
| `GITHUB_APP_NAME` | Slug de la GitHub App (pour l'URL d'installation) | `roadmaps-faciles` |

#### Licensing (self-host)

Variables pour le mode self-host avec licence. Voir `docs/adr/0028-licensing-server-self-host.md`.

| Variable | Description | Défaut |
|---|---|---|
| `LICENSE_KEY` | Clé de licence (format `rf_live_...`) — vide = mode Cloud | — |
| `LICENSING_SERVER_URL` | URL du serveur de licences | `https://licensing.roadmaps-faciles.fr` |
| `INSTANCE_ID` | Identifiant unique de l'instance self-hosted | — |

#### Seed (dev uniquement)

Variables utilisées uniquement par le script de seed (`pnpm prisma db seed`).

| Variable | Description | Défaut |
|---|---|---|
| `SEED_ADMIN_NAME` | Nom de l'admin seed | `Admin` |
| `SEED_ADMIN_EMAIL` | Email de l'admin seed | `admin@example.com` |
| `SEED_ADMIN_USERNAME` | Username de l'admin seed | `admin` |
| `SEED_ADMIN_IMAGE` | URL de l'avatar de l'admin seed | — |
| `SEED_TENANT_NAME` | Nom du tenant seed | `Le Site par Défaut` |
| `SEED_TENANT_SUBDOMAIN` | Sous-domaine du tenant seed | `default` |
| `SEED_MIN_FAKE_USERS` | Nombre min d'utilisateurs générés | `8` |
| `SEED_MAX_FAKE_USERS` | Nombre max d'utilisateurs générés | `16` |
| `SEED_MIN_FAKE_POSTS` | Nombre min de posts générés | `64` |
| `SEED_MAX_FAKE_POSTS` | Nombre max de posts générés | `256` |
| `SEED_MAX_FAKE_LIKES_PER_POST` | Nombre max de likes par post | `128` |
| `SEED_MAX_FAKE_COMMENTS_PER_POST` | Nombre max de commentaires par post | `16` |
| `SEED_MAX_REPLIES_PER_COMMENT` | Nombre max de réponses par commentaire | `8` |

---

### Base de données

```bash
# Générer Prisma Client
pnpm prisma generate

# Appliquer le schéma
pnpm prisma migrate dev

# (optionnel) Seed
pnpm seed
```

---

### Sous-domaine local (après seed)

Le seed crée un tenant local avec le sous-domaine `default`.  
Pour y accéder en local, ajouter dans `/etc/hosts` :

```
127.0.0.1	default.localhost:3000
```

---

### Lancer en dev

```bash
pnpm dev
```

L’application est servie sur **http://localhost:3000** pour le site principal, et **http://default.localhost:3000** pour le tenant `default`.

---

## ⚙️ Scripts utiles

```bash
pnpm lint                       # ESLint + format (tous les workspaces via Turbo)
pnpm build                      # Build production (apps/web via Turbo)
pnpm generateEnvDeclaration     # Générer env.d.ts à partir de .env.development

# Prisma
pnpm prisma:studio              # Prisma Studio (http://localhost:5555/)
pnpm prisma:reset               # Reset DB (migrations, pas de seed)
pnpm run-script xx.ts           # Permet d'exécuter un script TS présent dans /scripts/xx.ts

# Tests
pnpm test                       # Tests unitaires + intégration (tous les workspaces via Turbo)
pnpm test:coverage              # Idem avec couverture de code
pnpm test:db                    # Tests d'intégration DB (nécessite DATABASE_URL_TEST)
pnpm test:e2e                   # Tests E2E Playwright (nécessite dev server + docker services)

# packages/ui (Storybook)
pnpm --filter @roadmaps-faciles/ui storybook        # Lancer Storybook en dev
pnpm --filter @roadmaps-faciles/ui build-storybook  # Build statique Storybook

# Déploiement
./scripts/setup-github-environments.sh  # Setup one-shot des GitHub Environments + secrets Scalingo
```

---

## 🚢 Déploiement

Le déploiement est géré par GitHub Actions (push vers Scalingo) :

| Branche / Événement | Environnement | App Scalingo |
|---|---|---|
| Push sur `dev` (après CI) | staging | `roadmaps-faciles-staging` |
| Release (release-please tag) | production | `roadmaps-faciles` |
| `workflow_dispatch` | staging ou production | Au choix |
| Pull Request | review app | Créée automatiquement par Scalingo |

Le workflow `.github/workflows/deploy.yml` attend que Build, Lint et Tests passent avant de déployer. Les review apps sont gérées nativement par l'intégration Scalingo (auto-deploy désactivé, review apps activées).

---

## 🗂️ Structure de répertoires (extrait)

```
/apps/licensing/              # Serveur de licences Hono (BSL 1.1, git-crypt)
/apps/web/                    # Next.js 16 app (multi-tenant, DSFR + shadcn)
  /content/docs/              #   Documentation utilisateur (MDX, Fumadocs)
  /prisma/                    #   Schéma Prisma + seed + migrations + views
  /src/app/                   #   App Router (Next.js)
  /src/app/(default)/         #   Site principal
  /src/app/[domain]/          #   Multi-tenant
  /src/app/doc/               #   Documentation (layout, composants MDX, Fumadocs)
  /src/lib/model/             #   Schémas Zod (v4) - objets métier & DTO
  /src/useCases/              #   Logique métier (use cases DDD)
  /src/useCases/ee/           #   Use cases EE (intégrations, API keys, webhooks)
  /src/emails/                #   Templates email react-email (DSFR Mail)
  /src/lib/ee/                #   Features EE (providers, integrations, tracking, cron)
  /src/lib/gouv/              #   Features Gov (espace membre)
  /src/gouv/                  #   Composants Gov (DSFR, dsfr-bootstrap)
  /src/lib/repo/              #   Accès DB (Prisma) - fonctions CRUD
  /tests/testu/               #   Tests unitaires (Vitest)
  /tests/testi/               #   Tests d'intégration (use cases, mocks)
  /tests/testdb/              #   Tests d'intégration DB (Prisma, PostgreSQL)
  /tests/teste2e/             #   Tests E2E (Playwright, 7 projets)
/packages/ui/                 # @roadmaps-faciles/ui — 30 composants shadcn/Radix UI
  /src/components/            #   Composants + stories + tests co-localisés
  /src/tokens/                #   Design tokens CSS (French Blue, oklch)
  /.storybook/                #   Storybook 10 config (dark mode, a11y, vitest)
/docs/adr/                    # Architecture Decision Records
/docs/ddr/                    # Design Decision Records (palette, composants, conventions UI)
```

---

## 🧩 ADR / DDR (Decision Records)

Les **ADR** (Architecture Decision Records) vivent dans `docs/adr/` — décisions techniques et structurelles.
Les **DDR** (Design Decision Records) vivent dans `docs/ddr/` — décisions de design system (palette, composants, conventions UI).

- Nouveau fichier : `docs/{adr,ddr}/00xx-<slug>.md` (numéro séquentiel)
- Templates : `docs/adr/0000-template.md`, `docs/ddr/0000-template.md`
- Courtes, factuelles, datées, avec alternatives et conséquences.

---

## Licence

Ce projet utilise un modèle **triple licence** :

| Licence | Périmètre | Fichier |
|---------|-----------|---------|
| **AGPL v3** | Core (tout sauf `ee/` et `gouv/`) | [LICENSE](./LICENSE) |
| **BSL 1.1** | Enterprise Edition (`ee/`, `apps/licensing/`) | [LICENSE-EE](./LICENSE-EE) |
| **Gov License** | DSFR & services publics (`gouv/`) | [LICENSE-GOV](./LICENSE-GOV) |

Détails complets dans [LICENSING.md](./LICENSING.md).

© Roadmaps Faciles — [CGU](https://roadmaps-faciles.fr/cgu) · [Politique de confidentialité](https://roadmaps-faciles.fr/politique-de-confidentialite) · [Mentions légales](https://roadmaps-faciles.fr/mentions-legales) · [Accessibilité](https://roadmaps-faciles.fr/accessibilite)
