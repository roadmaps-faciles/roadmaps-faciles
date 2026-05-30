# DNS provider

Le DNS provider sert à **créer automatiquement les records DNS** côté votre zone (ex: créer un CNAME de vérification quand un tenant ajoute un custom domain). C'est distinct du [domain provider](../domain-provider/) (Caddy & co) qui gère le côté reverse proxy + TLS.

Si vos tenants n'ajoutent pas de custom domains (ou si vous gérez les DNS manuellement à chaque ajout), vous pouvez rester sur `noop` ou `manual`.

## Providers supportés

| Provider | `DNS_PROVIDER` | Cas d'usage |
|----------|---------------|-------------|
| Noop | `noop` (défaut) | Pas d'automatisation, vous ne proposez pas de feature custom domains |
| Manual | `manual` | Affiche les records à créer dans l'admin UI, vous les créez à la main |
| Cloudflare | `cloudflare` | Zone DNS hébergée chez Cloudflare, automatisation totale via API |
| OVH | `ovh` | Zone DNS hébergée chez OVH, automatisation totale via API |

Source code : [`apps/web/src/lib/ee/dns-provider/`](../../../apps/web/src/lib/ee/dns-provider/)

## Configuration

### Commun

```bash
DNS_PROVIDER="cloudflare"           # ou "ovh", "manual", "noop"
DNS_ZONE_NAME="votre-instance.com"  # nom de la zone DNS gérée
DNS_PROVIDER_TARGET="caddy.votre-instance.com"  # hostname cible pour les CNAMEs
```

### Cloudflare

Récupérer l'email du compte + Global API Key dans Cloudflare → My Profile → API Tokens.

```bash
DNS_PROVIDER=cloudflare
DNS_CLOUDFLARE_EMAIL=you@example.com
DNS_CLOUDFLARE_API_KEY=<global API key>
```

Le user de l'API doit avoir le scope `Zone:DNS:Edit` sur la zone `DNS_ZONE_NAME`.

### OVH

Créer un Application via [OVH API console](https://eu.api.ovh.com/createApp/) (scope `GET/POST/PUT/DELETE /domain/zone/*`).

```bash
DNS_PROVIDER=ovh
DNS_OVH_ENDPOINT=ovh-eu              # ou "ovh-ca"
DNS_OVH_APPLICATION_KEY=<app key>
DNS_OVH_APPLICATION_SECRET=<app secret>
DNS_OVH_CONSUMER_KEY=<consumer key obtenu via /auth/credential>
```

### Manual

Pas de credentials nécessaires : l'UI admin affiche les records à créer manuellement, votre équipe les crée chez votre registrar/DNS.

```bash
DNS_PROVIDER=manual
DNS_ZONE_NAME=votre-instance.com
DNS_PROVIDER_TARGET=caddy.votre-instance.com
```

### Noop

Aucune action côté DNS. Convient si :
- Vous ne proposez pas la feature custom domains
- Vous gérez les DNS hors process (terraform, autre outil)

```bash
DNS_PROVIDER=noop
```

## Cas d'usage : feature custom domains

Quand un tenant ajoute `feedback.client.com` comme custom domain :

1. L'app **génère un token de vérification** et le stocke en DB
2. L'app affiche au tenant : "ajoutez un CNAME `_verify-rmf.feedback.client.com` → `<token>.verify.votre-instance.com`"
3. Le tenant ajoute le CNAME chez son DNS (côté client)
4. L'app **vérifie le CNAME** via résolution DNS standard
5. Si OK, le tenant ajoute un CNAME final `feedback.client.com` → `caddy.votre-instance.com`
6. Caddy (côté votre infra) provisionne le cert à la première requête HTTPS via on-demand TLS

Le DNS provider intervient uniquement côté votre zone (étape 2 : créer les records de vérification). Le tenant gère sa propre zone DNS.

## Combinaison domain-provider + dns-provider

Pour la feature custom domains, vous avez besoin des deux :
- **dns-provider** côté votre zone (créer les CNAMEs de vérification)
- **domain-provider** côté votre proxy (accepter le domaine + provisionner le TLS)

Combinaisons typiques :

| Votre setup | dns-provider | domain-provider |
|-------------|-------------|----------------|
| VPS + Caddy + DNS chez Cloudflare | `cloudflare` | `caddy` |
| VPS + Caddy + DNS chez OVH | `ovh` | `caddy` |
| Scalingo + DNS chez Cloudflare | `cloudflare` | `scalingo` |
| Clever Cloud + DNS chez OVH | `ovh` | `clevercloud` |
| Sans custom domains | `noop` | `noop` |
