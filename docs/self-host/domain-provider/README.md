# Domain provider

Le domain provider gère le côté **reverse proxy + TLS** pour accepter les domaines personnalisés de vos tenants (`feedback.client.com` qui pointe vers votre instance). C'est distinct du [DNS provider](../dns-provider/) qui crée automatiquement les records DNS côté votre zone.

Si vos tenants n'ajoutent pas de custom domains (mono-domaine ou sous-domaines wildcards uniquement), vous pouvez rester sur `noop`.

## Providers supportés

| Provider | `DOMAIN_PROVIDER` | Cas d'usage |
|----------|-------------------|-------------|
| [Caddy](caddy/) | `caddy` | VPS, docker-compose, kubernetes ; vous opérez le proxy avec on-demand TLS |
| Scalingo | `scalingo` / `scalingo-wildcard` | App hébergée Scalingo ; délégation à l'API Scalingo |
| Clever Cloud | `clevercloud` | App hébergée Clever Cloud ; délégation à l'API CC |
| Noop | `noop` (défaut) | Pas de custom domains |

Source code : [`apps/web/src/lib/ee/domain-provider/`](../../../apps/web/src/lib/ee/domain-provider/)

## Caddy (recommandé self-host)

Pour un hébergement VPS / docker-compose / kubernetes, [**Caddy**](caddy/) est le provider recommandé : il accepte des domaines arbitraires et provisionne les certificats Let's Encrypt à la volée via [on-demand TLS](https://caddyserver.com/docs/automatic-https#on-demand-tls), en validant chaque domaine contre l'endpoint `/api/domains/check` de l'app.

Le dossier [`caddy/`](caddy/) fournit le `Caddyfile`, un `docker-compose.caddy.yml` et des manifests k8s prêts à l'emploi. Détails et schéma de flux : [`caddy/README.md`](caddy/README.md).

## Scalingo / Clever Cloud

Sur ces PaaS, la gestion des domaines est déléguée à l'API de la plateforme : aucune configuration de proxy de votre côté, uniquement des variables d'environnement. Voir les variables `DOMAIN_SCALINGO_*` / `DOMAIN_CLEVERCLOUD_*` dans la [doc Fumadocs `/doc/technical/self-hosting`](https://roadmaps-faciles.fr/doc/technical/self-hosting).

## Combinaison domain-provider + dns-provider

Pour la feature custom domains, vous avez besoin des deux briques :
- **domain-provider** côté votre proxy (accepter le domaine + provisionner le TLS)
- **dns-provider** côté votre zone (créer les CNAMEs de vérification)

Le tableau des combinaisons typiques est dans le [README du dns-provider](../dns-provider/).
