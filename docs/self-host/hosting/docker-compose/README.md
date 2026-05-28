# Stack docker-compose unifiée

Stack self-contained pour héberger Roadmaps Faciles sur un seul host (VPS, machine bare metal, ou même un laptop pour tester). Comprend :

- **web** : l'app Next.js (image GHCR pré-buildée par défaut, build local possible)
- **db** : PostgreSQL 17
- **redis** : Redis 7
- **minio** + **minio-init** : S3-compatible storage + création automatique du bucket
- **caddy** : reverse proxy avec TLS Let's Encrypt + on-demand TLS pour custom tenant domains

> Pour les features EE (BSL, licensing server), voir le scénario [Coolify split en services](../coolify/) qui couvre l'ajout du service licensing. Le compose ici ne le déploie pas.

## Démarrage

### 1. Prérequis

- Docker + Docker Compose installés
- Un domaine public pointant vers l'IP du host (record A `@` et `*`)
- Ports 80 + 443 ouverts dans le firewall

### 2. Configuration

```bash
cp .env.example .env
$EDITOR .env
```

Variables minimales à renseigner :
- `PUBLIC_DOMAIN` : votre domaine (ex: `feedback.mondomaine.fr`)
- `ACME_EMAIL` : email pour Let's Encrypt
- `ADMINS` : usernames super-admin (séparés par virgule)
- Tous les secrets (`AUTH_SECRET`, `SECURITY_*`, `INTEGRATION_ENCRYPTION_KEY`) : générer avec `openssl rand -base64 32`
- `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD` : choisir des passwords forts
- `MAILER_SMTP_*` : votre provider SMTP

### 3. Lancement

```bash
docker compose up -d
```

Coups d'œil :
- Logs : `docker compose logs -f web`
- Healthcheck : `curl https://<your-domain>/api/healthz`
- DB : `docker compose exec db psql -U postgres roadmaps-faciles`

### 4. Premier login

Une fois `/api/healthz` répond 200, créer le premier compte :
- Aller sur `https://<your-domain>/login`
- Magic link envoyé via SMTP
- Le username doit être dans `ADMINS` pour avoir les droits root

## Custom domains tenants

La feature custom domains (`feedback.client.com` → votre instance) nécessite que le client final configure un CNAME vers votre serveur :

```
feedback.client.com.  CNAME  <your-domain>.
```

Caddy provisionnera le cert TLS automatiquement à la première requête (on-demand TLS), après avoir validé via `/api/domains/check` que le domaine est rattaché à un tenant en DB.

Si vous n'avez pas besoin de cette feature, le bloc `https://` du Caddyfile peut être supprimé.

## Sans Caddy (vous avez déjà un reverse proxy)

Commenter le service `caddy` dans `docker-compose.yml` et exposer le port 3000 du service `web` directement :

```yaml
  web:
    ports:
      - "127.0.0.1:3000:3000"
```

Puis configurer votre proxy (nginx, Traefik, etc.) pour forwarder `<your-domain>` vers `127.0.0.1:3000`. Pensez à ajouter `<your-domain>:<port>` dans `ADDITIONAL_ROOT_DOMAINS` si votre proxy passe le port.

## Backups

### Postgres

Backup manuel ponctuel :

```bash
docker compose exec db pg_dump -U postgres roadmaps-faciles | gzip > backup-$(date +%F).sql.gz
```

Backup régulier : ajouter un cron sur le host ou utiliser [pgbackrest](https://pgbackrest.org/), [pg_back](https://github.com/orgrim/pg_back), ou un service managé.

### MinIO

Backup du volume `s3data` :

```bash
docker run --rm -v roadmaps-faciles_s3data:/data -v $PWD:/backup alpine \
  tar czf /backup/minio-backup-$(date +%F).tar.gz -C /data .
```

Ou utiliser `mc mirror` vers un stockage externe (S3, Backblaze B2, etc.).

## Mise à jour

Pour passer à une nouvelle version :

```bash
# Tag spécifique
WEB_IMAGE_TAG=v1.3.0 docker compose up -d web

# Ou éditer .env puis :
docker compose pull web && docker compose up -d web
```

Les migrations Prisma s'exécutent automatiquement au démarrage du container web (entrypoint).

## Production checklist

- [ ] `AUTH_SECRET`, `SECURITY_*`, `INTEGRATION_ENCRYPTION_KEY` générés et uniques par instance
- [ ] `POSTGRES_PASSWORD` et `MINIO_ROOT_PASSWORD` forts
- [ ] Backups Postgres scriptés (cron + rétention)
- [ ] Backup MinIO scripté ou stockage S3 externe
- [ ] DNS wildcard configuré
- [ ] Email SMTP de prod (pas un service de dev)
- [ ] Monitoring : healthcheck externe (UptimeKuma, Better Stack, etc.) sur `/api/healthz`
- [ ] Limite RAM/CPU sur les containers via `deploy.resources.limits` si machine partagée
- [ ] Test de restauration backup avant de mettre du trafic critique

## Alternatives

- **Coolify split en services** : meilleur pour la prod sérieuse, backups managés Postgres, scale par service. Voir [`../coolify/`](../coolify/)
- **PaaS** : voir [`../scalingo/`](../scalingo/) (Scalingo, Clever Cloud)
- **IaaS** : voir [`../scaleway/`](../scaleway/) (Scaleway, OVH Cloud, Hetzner, AWS) avec OpenTofu
