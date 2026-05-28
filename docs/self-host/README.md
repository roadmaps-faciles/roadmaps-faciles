# Self-host Roadmaps Faciles

Guides, templates et configs pour héberger votre propre instance de Roadmaps Faciles.

> **Licence** : Roadmaps Faciles est triple-licencé. Le code AGPL v3 est libre d'usage, modification et redistribution. Les features EE (sous `src/lib/ee/` et autres répertoires `ee/`) sont sous BSL 1.1 et nécessitent une licence d'usage commerciale au-delà de certaines limites. Voir [`LICENSING.md`](../../LICENSING.md) à la racine. Ce guide couvre le mode AGPL par défaut, avec mentions explicites quand une étape concerne les features EE.

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
