# Scénario IaaS : Scaleway (ou équivalent)

Guide d'architecture pour déployer Roadmaps Faciles sur une infra IaaS (Scaleway, OVH Cloud, Hetzner, AWS, etc.). Vous gérez tout : containers, DB, Redis, TLS, stockage.

> **Raccourci** : un setup OpenTofu complet est disponible dans [`tofu/`](./tofu/) ; il provisionne toute l'infra en un `tofu apply`. Voir [la section dédiée](#opentofu) plus bas.

> **Brique licensing optionnelle** : si vous n'utilisez pas les features EE (BSL), supprimez les sections / ressources `licensing` de la config. Le mode AGPL ne nécessite pas de serveur de licences.

## Vue d'ensemble

```
                   ┌──────────────────────────────────────────────────────────┐
                   │                    IaaS (Scaleway)                       │
                   │                                                          │
Internet ──HTTPS──▶│  ┌─────────┐    ┌──────────────┐   ┌────────────────┐   │
                   │  │  Caddy   │───▶│  apps/web    │   │ apps/licensing  │   │
                   │  │  :443    │    │  Next.js     │   │ Hono :3100      │   │
                   │  │  TLS     │    │  :3000       │   │                 │   │
                   │  │  on-demand│   └──────┬───────┘   └───────┬────────┘   │
                   │  └─────────┘           │                    │            │
                   │        │      ┌────────▼────────────────────▼─────────┐  │
                   │        │      │         PostgreSQL :5432              │  │
                   │        │      │   DB: roadmaps-faciles + licensing    │  │
                   │        │      └──────────────────────────────────────┘  │
                   │        │      ┌──────────────────┐                      │
                   │        │      │   Redis :6379     │                      │
                   │        │      └──────────────────┘                      │
                   │        │      ┌──────────────────┐                      │
                   │        │      │   S3 Object       │                      │
                   │        │      │   Storage          │                      │
                   │        │      └──────────────────┘                      │
                   └──────────────────────────────────────────────────────────┘
```

## Ce qui est à votre charge

| Brique           | Options Scaleway                        | Alternatives               |
|------------------|-----------------------------------------|----------------------------|
| Compute          | Kapsule (K8s), Serverless Containers, VPS (DEV1/GP1) | Docker Compose sur VPS |
| PostgreSQL       | Managed Database for PostgreSQL         | Auto-hébergé dans un container |
| Redis            | Non disponible managé                   | Upstash, auto-hébergé, KeyDB |
| TLS + reverse proxy | :                                    | **Caddy** (on-demand TLS, voir [`../../domain-provider/caddy/`](../../domain-provider/caddy/)) |
| Domaines custom  | :                                       | Caddy (`DOMAIN_PROVIDER=caddy`) |
| Stockage S3      | Object Storage (natif, S3-compatible)   | MinIO ou Garage auto-hébergé |
| DNS              | Scaleway DNS (ou externe)               | OVH, Cloudflare            |
| Email            | Transactional Email (TEM)               | Brevo, Mailjet, Postmark, Resend |
| Monitoring       | Cockpit (Grafana/Loki)                  | Sentry + PostHog (SaaS)    |

## Architecture Docker Compose (VPS)

Le setup le plus simple pour un VPS. Un seul `docker-compose.yml` avec tout :

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    environment:
      DOMAIN_CADDY_ASK_URL: "http://web:3000/api/domains/check"
      DOMAIN_CADDY_UPSTREAM: "web:3000"

  web:
    image: ghcr.io/roadmaps-faciles/roadmaps-faciles-web:latest
    # ou build local :
    # build:
    #   context: .
    #   dockerfile: Dockerfile
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/roadmaps-faciles"
      REDIS_URL: "redis://redis:6379"
      DOMAIN_PROVIDER: "caddy"
      DOMAIN_CADDY_ADMIN_URL: "http://caddy:2019"
      DOMAIN_CADDY_ASK_URL: "http://web:3000/api/domains/check"
      STORAGE_PROVIDER: "s3"
      # ... autres vars (voir README principal)
    depends_on:
      - db
      - redis

  # Brique optionnelle : licensing server pour features EE (BSL).
  # Si vous restez sur AGPL, supprimez ce service.
  licensing:
    build:
      context: apps/licensing
      dockerfile: Dockerfile
    restart: unless-stopped
    expose:
      - "3100"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/licensing"
      PORT: "3100"
      # ... autres vars licensing
    depends_on:
      - db

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
      POSTGRES_DB: roadmaps-faciles

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redisdata:/data

volumes:
  caddy_data:
  pgdata:
  redisdata:
```

Le `Caddyfile` de référence est dans [`../../domain-provider/caddy/Caddyfile`](../../domain-provider/caddy/Caddyfile). Pour le serveur de licences (optionnel), ajouter un bloc :

```
licensing.votre-domaine.com {
    reverse_proxy licensing:3100
}
```

## Architecture Kapsule (Kubernetes)

Pour du scaling horizontal. Les manifests Caddy sont dans [`../../domain-provider/caddy/k8s/`](../../domain-provider/caddy/k8s/).

### Briques

| Composant | Type K8s | Replicas |
|-----------|----------|----------|
| Caddy | Deployment + Service LoadBalancer | 1 |
| apps/web | Deployment + Service ClusterIP | 2-5 (HPA) |
| apps/licensing | Deployment + Service ClusterIP | 1 |
| PostgreSQL | Scaleway Managed DB (externe au cluster) | - |
| Redis | Deployment + Service ClusterIP (ou Upstash) | 1 |

### Provisioning

```bash
# Cluster
scw k8s cluster create name=roadmaps-faciles version=1.30 \
  pools.0.name=default pools.0.node-type=DEV1-M pools.0.size=2

# DB managée (1 ou 2 bases selon usage licensing)
scw rdb instance create name=roadmaps-faciles engine=PostgreSQL-17 node-type=DB-DEV-S
scw rdb database create instance-id=<id> name=roadmaps-faciles
scw rdb database create instance-id=<id> name=licensing  # optionnel (features EE)

# Déploiement
scw k8s kubeconfig install <cluster-id>
kubectl apply -f ../../domain-provider/caddy/k8s/
kubectl apply -f <vos-manifests>/
```

## Stockage S3 (Scaleway Object Storage)

Natif et S3-compatible. C'est la brique la plus simple a setup.

```bash
# Créer le bucket
scw object bucket create name=<your-bucket> region=fr-par
scw object bucket update name=<your-bucket> region=fr-par visibility=public-read
```

Configuration dans l'app :

```bash
STORAGE_PROVIDER=s3
STORAGE_S3_ENDPOINT=https://s3.fr-par.scw.cloud
STORAGE_S3_REGION=fr-par
STORAGE_S3_BUCKET=<your-bucket>
STORAGE_S3_ACCESS_KEY_ID=SCWxxxxxxxxxxxxxxxxx
STORAGE_S3_SECRET_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
STORAGE_S3_PUBLIC_URL=https://<your-bucket>.s3.fr-par.scw.cloud
```

Structure des clés en bucket : `images/{uuid}.{ext}` (markdown embeds), `avatars/{userId}/{uuid}.{ext}` (avatars users), `tenants/{tenantId}/{logo|banner}.{ext}` (assets tenants).

L'URL publique est automatiquement ajoutée au CSP (`img-src`) via `next.config.ts`.

## DNS

Deux options :

1. **Scaleway DNS** - si le domaine est chez Scaleway
2. **DNS externe** (OVH, Cloudflare) - via le `DNS_PROVIDER` de l'app

Pour les sous-domaines tenants (`tenant.votre-instance.com`), un wildcard CNAME vers le serveur Caddy suffit :

```
*.votre-instance.com.  CNAME  caddy.votre-instance.com.
```

Caddy gere le TLS on-demand (interroge `/api/domains/check` avant d'emettre un certificat).

## Email

Scaleway Transactional Email (TEM) ou un SMTP externe :

```bash
# Scaleway TEM
MAILER_SMTP_HOST=smtp.tem.scw.cloud
MAILER_SMTP_PORT=465
MAILER_SMTP_SSL=true
MAILER_SMTP_LOGIN=<project-id>
MAILER_SMTP_PASSWORD=<secret-key>
```

## OpenTofu

Le repertoire [`tofu/`](./tofu/) contient une configuration OpenTofu complete qui provisionne toute l'infra Scaleway en une commande.

### Ce qui est provisionne

| Ressource | Type Scaleway | Description |
|-----------|---------------|-------------|
| Object Storage | `scaleway_object_bucket` | Bucket S3 pour les images |
| PostgreSQL | `scaleway_rdb_instance` + 2 databases | DB managee (roadmaps-faciles + licensing) |
| Registry | `scaleway_registry_namespace` | Registry Docker prive |
| Container web | `scaleway_container` | Serverless Container Next.js |
| Container licensing | `scaleway_container` | Serverless Container Hono |
| VPS Caddy | `scaleway_instance_server` | DEV1-S avec cloud-init (Caddy + TLS on-demand) |
| IP publique | `scaleway_instance_ip` | IP fixe pour le DNS |
| DNS (optionnel) | `scaleway_domain_record` | A + wildcard + licensing |

### Usage

```bash
cd docs/deploy/scaleway/tofu

# Init
tofu init

# Configurer (copier et editer)
cp staging.tfvars my-env.tfvars
# Renseigner les secrets via TF_VAR_ ou dans le fichier

# Preview
tofu plan -var-file=my-env.tfvars

# Deployer
tofu apply -var-file=my-env.tfvars
```

### Secrets

Les secrets ne doivent pas être dans les `.tfvars`. Passer via variables d'environnement :

```bash
export TF_VAR_db_password="..."
export TF_VAR_jwt_secret="..."
export TF_VAR_webhook_secret="..."
export TF_VAR_scw_access_key="..."
export TF_VAR_scw_secret_key="..."

# Optionnels (features EE / licensing) :
# export TF_VAR_licensing_private_key="..."
# export TF_VAR_stripe_secret_key="..."
# export TF_VAR_stripe_webhook_secret="..."

tofu apply -var-file=my-env.tfvars
```

### Staging = Prod

Meme config, juste les variables qui changent :

```bash
# Staging
tofu workspace new staging
tofu apply -var-file=staging.tfvars

# Prod
tofu workspace new prod
tofu apply -var-file=prod.tfvars  # db_node_type=DB-GP-XS, web_max_scale=5, etc.
```

### Architecture résultante

```
Internet ──▶ Caddy (DEV1-S, IP fixe)
                ├── *.votre-instance.com ──▶ Serverless Container web (:3000)
                └── licensing.votre-instance.com ──▶ Serverless Container licensing (:3100) [optionnel]
                                                           │
                     ┌─────────────────────────────────────┘
                     ▼
              PostgreSQL Managed (roadmaps-faciles + licensing)
              Object Storage S3
              Redis (externe : Upstash ou auto-hébergé)
```

Redis n'est pas provisionné par OpenTofu car Scaleway n'a pas de Redis managé. Utiliser Upstash (serverless, free tier disponible) ou ajouter un container Redis sur le VPS Caddy.

## Différences clés avec le scénario PaaS

| Aspect | PaaS (Scalingo) | IaaS (Scaleway) | IaaS + OpenTofu |
|--------|-----------------|-----------------|-----------------|
| TLS domaines custom | Scalingo (unitaire ou wildcard) | Caddy on-demand (wildcard) | Idem, provisionné |
| Deploy | Git push (Procfile) | Docker build + push image | Idem |
| DB | Addon managé | Managed DB ou auto-hébergé | Managed DB (auto) |
| Redis | Addon managé | À provisionner | À provisionner |
| S3 | Externe obligatoire | Natif (Object Storage) | Provisionné (auto) |
| Provisioning | Manuel (console/CLI) | Manuel (console/CLI) | `tofu apply` |
| Reproductibilité | Limitée (scalingo.json) / `tofu apply` | Faible | Totale (IaC) |
| Coût fixe minimal | ~30-50 €/mois | ~15-25 €/mois | Idem |
| Complexité ops | Faible | Élevée | Moyenne |
