# Coolify (self-host)

[Coolify](https://coolify.io/) est une plateforme open source style Heroku/Render. Vous installez Coolify sur votre VPS, puis vous y déployez Roadmaps Faciles depuis votre fork du repo.

> **Brique licensing optionnelle** : si vous n'utilisez pas les features EE (BSL), supprimez l'app `licensing` et sa DB. Le mode AGPL ne nécessite pas de serveur de licences.

## Deux approches

Vous avez le choix entre **split en services** (recommandé pour scale et maintenance) ou **stack unifiée docker-compose** (plus simple pour un démarrage).

| Approche | Avantages | Inconvénients |
|----------|-----------|--------------|
| **Split en services Coolify** | Backups Postgres individuels, scale indépendant par service, redémarrages isolés | Plus de clicks au setup, plus de ressources Coolify à gérer |
| **Stack unifiée docker-compose** | 1 seul project Coolify, démarrage rapide, idéal pour test/perso | Pas de backup managé par Coolify (à scripter), redémarrage de la stack entière |

Pour la stack unifiée, voir [`docs/self-host/hosting/docker-compose/`](../docker-compose/) et lancer le compose directement (avec ou sans Coolify).

Ce guide couvre le **split en services**.

## Vue d'ensemble

```
                  ┌─────────────────────────────────────────────────┐
                  │                Coolify (votre VPS)              │
Internet ──HTTPS──▶  Traefik (intégré Coolify)                       │
                  │     │                                            │
                  │     ▼                                            │
                  │  ┌───────────┐  ┌──────────────┐  ┌───────────┐  │
                  │  │  web      │  │ licensing    │  │  proxy    │  │
                  │  │  :3000    │  │ :3001 (opt.) │  │  Caddy    │  │
                  │  └─────┬─────┘  └──────┬───────┘  │  (opt.)   │  │
                  │        │               │           └───────────┘  │
                  │  ┌─────▼───────────────▼────┐                     │
                  │  │   PostgreSQL :5432       │                     │
                  │  └──────────────────────────┘                     │
                  │  ┌──────────────────────────┐                     │
                  │  │   Redis :6379            │                     │
                  │  └──────────────────────────┘                     │
                  │  ┌──────────────────────────┐                     │
                  │  │   Garage / MinIO (S3)    │                     │
                  │  └──────────────────────────┘                     │
                  └─────────────────────────────────────────────────┘
```

## Prérequis serveur

- Serveur ≥ 4 GB RAM, 2 vCPU, 40 GB disque (plus si MinIO/Garage colocalisé avec beaucoup d'uploads)
- Domaine principal pointant vers l'IP du serveur (record A `@`)
- Wildcard DNS `*.<domain>` pour les sous-domaines tenants
- Si vous voulez le wildcard cert Let's Encrypt : un DNS provider supporté par Traefik (Cloudflare, OVH, Gandi, Route 53, etc.)

## 1. Installer Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Suivre l'installation. Coolify se lance sur le port 8000 par défaut.

## 2. DNS

Records minimaux :

```
@        A    <IP serveur>
*        A    <IP serveur>
```

Si vous activez le licensing optionnel :

```
licensing A   <IP serveur>
```

## 3. Wildcard cert Let's Encrypt (recommandé)

Sans wildcard, chaque sous-domaine tenant doit faire un challenge HTTP individuel, ce qui rapidement vous fait dépasser les rate limits Let's Encrypt (50 certs/semaine par registered domain).

Dans Coolify : **Settings → Server → Proxy → Custom Traefik Configuration** :

```yaml
certificatesResolvers:
  letsencrypt-wildcard:
    acme:
      email: contact@<your-domain>
      storage: /data/coolify/proxy/acme.json
      dnsChallenge:
        provider: <gandiv5|cloudflare|ovh|...>
        delayBeforeCheck: 30
```

Variables d'env du proxy Coolify (pour Gandi) :

```
GANDIV5_PERSONAL_ACCESS_TOKEN=<token avec scope Manage DNS records>
```

Autres providers : voir [traefik dnschallenge providers](https://doc.traefik.io/traefik/https/acme/#providers).

## 4. Services partagés

### PostgreSQL

Créer un service Postgres Coolify. Coolify provisionne le user `postgres` et la DB par défaut. Pour licensing, soit créer une seconde DB sur la même instance via init script, soit un second service Postgres.

```sql
CREATE DATABASE "roadmaps-faciles";
CREATE DATABASE "licensing";  -- si features EE
```

Backup : activer le backup managé Coolify, vers un bucket S3 ou un volume distant.

### Redis

Créer un service Redis. Pas de backup nécessaire (cache volatile).

### Stockage S3 (MinIO ou Garage)

Roadmaps Faciles utilise S3-compatible storage pour les uploads (avatars, images embed markdown, logos tenants).

Options :
- **MinIO** : largement adopté, UI console intégrée
- **Garage** : alternative légère orientée single-node ou cluster simple
- **Service externe** : Scaleway Object Storage, Backblaze B2, AWS S3, etc.

Pour MinIO/Garage colocalisé sur le serveur Coolify :
1. Créer un service Docker Compose Coolify avec l'image MinIO/Garage
2. Exposer l'API sur `s3.<your-domain>` et la console sur `console.<your-domain>`
3. Créer le bucket et un service account scope-restreint

```bash
# Avec mc (MinIO client) une fois MinIO up
mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
mc mb local/<your-bucket>
mc anonymous set download local/<your-bucket>
```

## 5. App web

Créer une nouvelle application Coolify :

- **Source** : votre fork du repo GitHub (ou directement `roadmaps-faciles/roadmaps-faciles`)
- **Build Pack** : Dockerfile (`/Dockerfile` à la racine)
- **Port** : 3000
- **Domaines** : `<your-domain>` + `*.<your-domain>` avec resolver `letsencrypt-wildcard`

> **Limitation Traefik v3 + wildcard SNI** : si vous combinez le wildcard cert avec `Host(*.x.y)`, Traefik génère `HostSNI(*.x.y)` qui est invalide. Solution : configurer une route via fichier dynamique Traefik avec `HostRegexp`. Détails dans [`/docs/self-host/hosting/coolify/wildcard-route.md`](./wildcard-route.md).

### Build args

```
NEXT_PUBLIC_SITE_URL=https://<your-domain>
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BRAND_NAME=<Votre marque>
NEXT_PUBLIC_TRACKING_PROVIDER=noop  # ou posthog/matomo
NEXT_PUBLIC_REPOSITORY_URL=https://github.com/<you>/<repo>
SOURCE_COMMIT=<sha>                  # injecté par votre CI
IMAGE_REF=<branch ou tag>            # injecté par votre CI
INCLUDE_PSQL=0                       # 1 uniquement pour review apps (entrypoint l'utilise)
```

### Variables runtime

Voir [`apps/web/src/config.ts`](../../../../apps/web/src/config.ts) pour la liste exhaustive. Variables critiques :

```
NODE_ENV=production
AUTH_TRUST_HOST=1
AUTH_SECRET=<32 bytes random>
AUTH_URL=https://<your-domain>/api/auth
SECURITY_JWT_SECRET=<random>
SECURITY_WEBHOOK_SECRET=<random>
INTEGRATION_ENCRYPTION_KEY=<random>

DATABASE_URL=postgresql://postgres:<pwd>@<postgres-service>:5432/roadmaps-faciles?schema=public
REDIS_URL=redis://<redis-service>:6379

# Storage (MinIO/Garage local exemple)
STORAGE_PROVIDER=s3
STORAGE_S3_ENDPOINT=http://minio:9000
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=<your-bucket>
STORAGE_S3_ACCESS_KEY_ID=<service-account-key>
STORAGE_S3_SECRET_ACCESS_KEY=<service-account-secret>
STORAGE_S3_PUBLIC_URL=https://s3.<your-domain>/<your-bucket>
STORAGE_MAX_FILE_SIZE_MB=5

# SMTP
MAILER_SMTP_HOST=smtp.example.com
MAILER_SMTP_PORT=587
MAILER_SMTP_SSL=false                # 587 STARTTLS, true pour 465
MAILER_SMTP_LOGIN=<user>
MAILER_SMTP_PASSWORD=<password>
MAILER_FROM_EMAIL="Roadmaps <noreply@<your-domain>>"

# Multi-tenant
ADDITIONAL_ROOT_DOMAINS=localhost:3000  # ajouter les domaines internes utilisés par Coolify pour healthcheck

# Admins
ADMINS=<your-username>
```

### Healthcheck

L'image Dockerfile inclut un `HEALTHCHECK` sur `GET /api/healthz`. Coolify le détecte automatiquement.

> **Gotcha IPv4/IPv6** : le healthcheck du Dockerfile utilise `127.0.0.1` et non `localhost` pour éviter la résolution `::1` qui échoue dans certaines configs container.

## 6. App licensing (optionnel, features EE)

Si vous restez sur AGPL, **sautez cette étape**.

- **Source** : votre fork
- **Build Pack** : Dockerfile (`/Dockerfile.licensing`)
- **Port** : 3001
- **Domaine** : `licensing.<your-domain>` ou interne uniquement
- **Build secret** (BuildKit) : `GIT_CRYPT_KEY_B64` si vous travaillez depuis un repo chiffré avec git-crypt (voir Gotchas)

### Variables runtime

Voir [`apps/licensing/`](../../../../apps/licensing/) pour la liste. Critiques :

```
DATABASE_URL=postgresql://postgres:<pwd>@<postgres-service>:5432/licensing?schema=public
LICENSING_ED25519_PRIVATE_KEY=<base64 PEM>
STRIPE_SECRET_KEY=sk_xxx              # si vous facturez via Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_ENV=production
CORS_ORIGINS=https://<your-domain>
```

## 7. Trigger de déploiement

Coolify lit les webhooks GitHub. À configurer par app :

| App | Trigger conseillé |
|-----|-------------------|
| web (prod) | Push tag `v*` (release-please) ou push branche `main` |
| web (staging) | Push branche `dev` |
| licensing | Push tag `v*` ou manuel |

## Migration depuis un autre hébergeur

1. Provisionner serveur + Coolify
2. Setup Traefik wildcard cert (cf. plus haut)
3. Créer les services (Postgres, Redis, S3, app web)
4. Importer les variables d'env depuis votre setup actuel
5. Dump l'ancienne DB Postgres + restore vers le service Postgres Coolify (`pg_dump` + `pg_restore`)
6. Bascule DNS en TTL court (300s) avant cutover, monter à 3600s après stabilisation
7. Décommissioner l'ancien hébergeur après période de validation

## Points à valider en condition réelle

- **Cold start container** : Next.js standalone + `prisma migrate deploy` + seed conditionnel → mesurer le temps d'init (acceptable < 30s)
- **Backups Postgres** : configurer + tester un restore avant de mettre du trafic critique
- **Stockage S3 uptime** : MinIO/Garage en single-node est un point de défaillance ; prévoir backup du bucket (snapshot cross-region ou rsync vers stockage externe)
- **Wildcard cert renewal** : Let's Encrypt renouvelle 30 jours avant expiration, vérifier les logs Traefik pour confirmer le DNS challenge OK avant l'expiration du premier cert

## Custom domains tenants

Pour permettre à vos tenants d'utiliser leur propre domaine (`feedback.client.com`), il faut un mécanisme on-demand TLS. Traefik ne le supporte pas nativement bien.

Solutions :
- Déployer Caddy en complément (cf. [`docs/self-host/domain-provider/caddy/`](../../domain-provider/caddy/)) en mode reverse-proxy devant Coolify pour cette feature uniquement
- Utiliser un autre proxy supportant on-demand TLS (Caddy, certaines configs nginx + acme.sh)

Si vous n'avez pas besoin de cette feature, vos tenants utilisent uniquement les sous-domaines `tenant.<your-domain>` couverts par le wildcard cert.
