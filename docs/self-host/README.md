# Self-host Roadmaps Faciles

Guides, templates et configs pour héberger votre propre instance de Roadmaps Faciles.

> **Licence et serveur de licences** : Roadmaps Faciles est triple-licencé (AGPL v3 / BSL 1.1 / Gov). Les features EE (sous `ee/`) sont activées au runtime via une clé de licence validée contre **notre serveur officiel** (`https://licensing.roadmaps-faciles.fr`, valeur par défaut de `LICENSING_SERVER_URL`). Vous n'avez **jamais à héberger le serveur de licences vous-même** : il appartient au modèle SaaS root. Détails du modèle de licence : [`LICENSING.md`](../../LICENSING.md) à la racine.

## Choisir son setup

Quatre scénarios documentés, du plus simple au plus contrôlé :

| Scénario | Pour qui ? | Coût initial | Complexité ops |
|----------|-----------|--------------|----------------|
| [**Docker Compose unifié**](hosting/docker-compose/) | Démarrage rapide, perso, petit projet | ~5 €/mois (VPS) | Faible |
| [**Coolify**](hosting/coolify/) | Plateforme self-hosted style Heroku, backups managés | ~10 €/mois (VPS) | Faible-moyenne |
| [**Scalingo**](hosting/scalingo/) (PaaS) | Aucune gestion infra, focus produit | ~30-50 €/mois | Très faible |
| [**Scaleway**](hosting/scaleway/) (IaaS) | Contrôle total, scale horizontal, IaC | ~15-25 €/mois | Élevée |

Les scénarios IaaS et Coolify peuvent être provisionnés avec [OpenTofu](https://opentofu.org/) (cf. répertoires `tofu/` dans les sous-dossiers).

## Briques transverses

Quel que soit votre hébergeur, vous aurez peut-être besoin de :

### [Domain provider](domain-provider/)

**Quand** : vos tenants veulent utiliser leur propre domaine (`feedback.client.com`).

Le domain provider gère le côté **reverse proxy + TLS** pour accepter des domaines arbitraires.

- [**Caddy**](domain-provider/caddy/) : reverse proxy on-demand TLS, recommandé pour VPS/docker/k8s
- Scalingo / Clever Cloud : délégation à l'API du PaaS (configuration côté env vars uniquement, pas de doc dédiée)

### [DNS provider](dns-provider/)

**Quand** : vous voulez automatiser la création de records DNS côté votre zone (pour la feature custom domains).

- Cloudflare, OVH, Manual, Noop : voir le [README dédié](dns-provider/)

## Déploiement gouvernemental

Vous êtes un opérateur public (administration, collectivité, opérateur de l'État, incubateur beta.gouv) ? Le guide [**GOUVERNEMENTAL.md**](GOUVERNEMENTAL.md) couvre les briques spécifiques :

- Thème DSFR (les deux verrous : licence Gov + domaine `.gouv.fr`)
- Licence `GOV_LICENSED`
- Authentification ProConnect et Espace Membre (beta.gouv)
- Bootstrap d'instance via `POST /api/setup`
- Pages légales, branding État, et checklist de conformité (RGAA, RGPD/CNIL, résidence des données)

À lire **en complément** d'un des scénarios d'hébergement ci-dessus, pas à la place.

## Stack technique requise

| Composant | Version min | Notes |
|-----------|-------------|-------|
| Node.js | 24 | Pour les builds locaux. L'image Docker pré-buildée n'en a pas besoin |
| PostgreSQL | 17 | Stable, recommandé. 16 fonctionne. |
| Redis | 6+ | Cache, sessions, 2FA challenges |
| Stockage S3-compatible | : | Garage (recommandé self-host), MinIO, Scaleway Object Storage, AWS S3, Backblaze B2 |
| SMTP | : | Pour magic links + invitations. Resend, Brevo, Mailjet, etc. |

## Image Docker

L'image officielle est publiée sur GHCR :

```
ghcr.io/roadmaps-faciles/roadmaps-faciles-web:latest
ghcr.io/roadmaps-faciles/roadmaps-faciles-web:main           # branche principale
ghcr.io/roadmaps-faciles/roadmaps-faciles-web:dev            # nightly dev
ghcr.io/roadmaps-faciles/roadmaps-faciles-web:v1.2.3         # releases
ghcr.io/roadmaps-faciles/roadmaps-faciles-web:1.2.3          # alias semver
ghcr.io/roadmaps-faciles/roadmaps-faciles-web:1.2            # alias semver majeur.mineur
```

Vous pouvez aussi build localement :

```bash
git clone https://github.com/roadmaps-faciles/roadmaps-faciles
cd roadmaps-faciles
docker build -t roadmaps-faciles-web -f Dockerfile .
```

## Variables d'environnement

La liste exhaustive est dans [`apps/web/src/config.ts`](../../apps/web/src/config.ts). Les variables critiques sont documentées dans chaque scénario d'hébergement.

Pour le tour complet (avec descriptions de chaque variable), voir la [doc Fumadocs `/doc/technical/self-hosting`](https://roadmaps-faciles.fr/doc/technical/self-hosting).

## Mises à jour

### Migrations Prisma

L'entrypoint du container web exécute automatiquement `prisma migrate deploy` au démarrage. Les nouvelles migrations sont appliquées sans intervention.

### Breaking changes

Documentés dans le [CHANGELOG](../../CHANGELOG.md). Lire avant de bumper une version majeure (`v1.x` → `v2.x`).

## Support

- Issues : [github.com/roadmaps-faciles/roadmaps-faciles/issues](https://github.com/roadmaps-faciles/roadmaps-faciles/issues)
- Discussions : [github.com/roadmaps-faciles/roadmaps-faciles/discussions](https://github.com/roadmaps-faciles/roadmaps-faciles/discussions)

## Contribuer

Vous opérez votre propre instance et avez trouvé un gotcha, un bug, ou amélioré un template ? PRs welcome sur `docs/self-host/`.
