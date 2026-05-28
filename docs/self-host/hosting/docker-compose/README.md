# Stack docker-compose unifiée

Stack self-contained pour héberger Roadmaps Faciles sur un seul host (VPS, machine bare metal, ou même un laptop pour tester). Comprend :

- **web** : l'app Next.js (image GHCR pré-buildée par défaut, build local possible)
- **db** : PostgreSQL 17
- **redis** : Redis 7
- **garage** : [Garage](https://garagehq.deuxfleurs.fr/) v2.3.0, stockage S3-compatible single-node ; le bucket et la clé d'accès sont créés automatiquement au premier boot via `--default-bucket`
- **caddy** : reverse proxy avec TLS Let's Encrypt + on-demand TLS pour custom tenant domains

Pourquoi Garage et pas MinIO : Garage est plus léger (Rust, single binary, ~50 MB RAM en single-node), maintenu activement et orienté self-host. MinIO reste compatible mais évolue vers un modèle plus enterprise. Pour utiliser MinIO à la place, remplacer le service `garage` par l'image `minio/minio` et ajuster `STORAGE_S3_ENDPOINT` (`http://minio:9000`) et `STORAGE_S3_REGION` (`us-east-1`) côté env web.


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
- Tous les secrets app (`AUTH_SECRET`, `SECURITY_*`, `INTEGRATION_ENCRYPTION_KEY`) : générer avec `openssl rand -base64 32`
- `POSTGRES_PASSWORD` : choisir un password fort
- `MAILER_SMTP_*` : votre provider SMTP

### 2.bis. Setup Garage

Garage exige un secret RPC dans `garage.toml` (utilisé pour authentifier les communications inter-nodes, même en single-node) et des access keys S3 :

```bash
# Secret RPC dans garage.toml (remplace le placeholder)
sed -i.bak "s/REPLACE_WITH_OPENSSL_RAND_HEX_32/$(openssl rand -hex 32)/" garage.toml && rm garage.toml.bak

# Access key + secret S3 dans .env
echo "GARAGE_DEFAULT_ACCESS_KEY=GK$(openssl rand -hex 16)" >> .env
echo "GARAGE_DEFAULT_SECRET_KEY=$(openssl rand -hex 32)" >> .env
```

> Garage 2.3+ avec `--single-node --default-bucket` initialise tout au premier boot : layout cluster, bucket avec le nom de `GARAGE_DEFAULT_BUCKET`, access key avec les valeurs ci-dessus. Pas besoin de `garage layout assign` manuel.

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

### Garage

Backup des volumes `garage_meta` (métadonnées) et `garage_data` (objets) :

```bash
docker run --rm \
  -v roadmaps-faciles_garage_meta:/meta \
  -v roadmaps-faciles_garage_data:/data \
  -v $PWD:/backup alpine \
  tar czf /backup/garage-backup-$(date +%F).tar.gz -C / meta data
```

Ou utiliser un client S3 (aws-cli, mc, rclone) avec les credentials Garage pour `sync`/`mirror` vers un stockage externe (S3, Backblaze B2, etc.).

> Penser à faire le backup avec Garage **arrêté** ou via un snapshot du filesystem (LVM, ZFS) pour garantir la cohérence des métadonnées.

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
- [ ] `POSTGRES_PASSWORD` fort
- [ ] `GARAGE_DEFAULT_SECRET_KEY` + `rpc_secret` dans `garage.toml` générés via `openssl rand -hex 32`
- [ ] Backups Postgres scriptés (cron + rétention)
- [ ] Backup Garage (volumes `garage_meta` + `garage_data`) scripté ou stockage S3 externe via rclone/aws-cli
- [ ] DNS wildcard configuré
- [ ] Email SMTP de prod (pas un service de dev)
- [ ] Monitoring : healthcheck externe (UptimeKuma, Better Stack, etc.) sur `/api/healthz`
- [ ] Limite RAM/CPU sur les containers via `deploy.resources.limits` si machine partagée
- [ ] Test de restauration backup avant de mettre du trafic critique

## Alternatives

- **Coolify split en services** : meilleur pour la prod sérieuse, backups managés Postgres, scale par service. Voir [`../coolify/`](../coolify/)
- **PaaS** : voir [`../scalingo/`](../scalingo/) (Scalingo, Clever Cloud)
- **IaaS** : voir [`../scaleway/`](../scaleway/) (Scaleway, OVH Cloud, Hetzner, AWS) avec OpenTofu
