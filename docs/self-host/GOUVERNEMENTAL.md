# Déploiement gouvernemental

Guide d'hébergement de Roadmaps Faciles pour un opérateur public (administration, collectivité, opérateur de l'État, incubateur beta.gouv). Il complète les guides d'hébergement génériques ([Docker Compose](hosting/docker-compose/), [Coolify](hosting/coolify/), [Scalingo](hosting/scalingo/), [Scaleway](hosting/scaleway/)) avec les briques spécifiques au secteur public : licence Gov, thème DSFR, authentification ProConnect et Espace Membre, bootstrap d'instance, pages légales et conformité.

> **À lire d'abord** : commencez par le guide d'hébergement qui correspond à votre infra (le [Docker Compose unifié](hosting/docker-compose/) est le plus simple). Ce document n'explique PAS comment déployer l'image : il décrit uniquement la configuration additionnelle pour un usage gouvernemental.

## Vue d'ensemble

Un déploiement gouvernemental se distingue d'un déploiement standard sur cinq points :

1. **Thème DSFR** : le Système de Design de l'État (DSFR) peut être activé sur un tenant, sous deux conditions cumulatives (licence Gov + domaine `.gouv.fr`).
2. **Licence Gov** : le DSFR et les features EE sont débloqués par une clé de licence `GOV_LICENSED`, émise manuellement après qualification.
3. **Authentification** : ProConnect (fédération d'identité de l'État) et Espace Membre (beta.gouv) en plus du mot de passe et du magic link.
4. **Pages légales** : mentions légales, politique de confidentialité, CGU et déclaration d'accessibilité à renseigner avec les informations de l'opérateur public.
5. **Conformité** : RGAA, RGPD/CNIL, résidence des données en France ou dans l'UE.

Toutes les variables ci-dessous sont lues dans [`apps/web/src/config.ts`](../../apps/web/src/config.ts). Les variables préfixées `NEXT_PUBLIC_` sont injectées au build et exposées au navigateur ; les autres sont lues au runtime côté serveur.

## Licence Gov

Roadmaps Faciles est triple-licencié (AGPL v3 / BSL 1.1 / Gov). Les features EE (sous `ee/`) et le thème DSFR sont activés au runtime par une clé de licence. Le modèle complet est documenté dans [`LICENSING.md`](../../LICENSING.md) à la racine.

### Comportement

- La clé est posée dans `LICENSE_KEY` (format `rf_live_<payload>.<signature>`, signée Ed25519).
- Elle est **vérifiée hors ligne** (signature + date d'expiration) grâce à la clé publique embarquée dans l'image, puis **rafraîchie en ligne toutes les 24h** contre le serveur de licences (`LICENSING_SERVER_URL`, défaut `https://licensing.roadmaps-faciles.fr`).
- Si le serveur de licences est injoignable, une **période de grâce de 7 jours** maintient la licence active (à partir de la dernière vérification en ligne réussie).
- **Vous n'hébergez JAMAIS le serveur de licences** : il appartient au modèle SaaS root. Vous consommez uniquement la clé.
- Sans `LICENSE_KEY`, l'instance tourne en **mode community** : les features core fonctionnent (authentification, boards, posts, votes, commentaires), mais pas le DSFR ni les features EE.

### Plans de licence

| Plan | Effet | Émission |
|------|-------|----------|
| (aucune clé) | Mode community, features core uniquement | - |
| `LICENSED` | Toutes les features EE, **mais pas le DSFR** | Via Stripe Checkout |
| `GOV_LICENSED` | Toutes les features EE **+ le thème DSFR** | Manuelle, après qualification gouvernementale |

> Le DSFR est réservé au plan `GOV_LICENSED` : une licence `LICENSED` standard ne déverrouille PAS le thème DSFR. C'est la première des deux conditions du thème DSFR (voir section suivante).

### Variables

| Variable | Défaut | Rôle |
|----------|--------|------|
| `LICENSE_KEY` | (vide) | Clé de licence `rf_live_...`. Vide = mode community |
| `LICENSING_SERVER_URL` | `https://licensing.roadmaps-faciles.fr` | Serveur de vérification en ligne. Ne pas changer en self-host |
| `INSTANCE_ID` | (auto) | Identifiant d'instance pour le binding de la licence. Si vide, généré automatiquement (UUID) et persisté en base au premier démarrage |

> `INSTANCE_ID` n'est pas obligatoire : laissé vide, l'instance s'auto-génère un UUID stable et le stocke en base (`AppSettings.instanceId`). Posez-le explicitement uniquement si vous voulez contrôler la valeur (ex : reprise d'identité après migration de base).

## Thème DSFR : deux verrous orthogonaux

Le thème par défaut de l'application reste **Default** (design shadcn maison). Le thème **DSFR** doit être activé explicitement par tenant, et il exige DEUX conditions indépendantes, toutes deux nécessaires :

1. **Verrou organisation (licence)** : l'organisation doit avoir l'entitlement `THEME_DSFR`.
   - En self-host : une `LICENSE_KEY` de plan `GOV_LICENSED` valide.
   - En cloud : un plan d'organisation `GOV`.
2. **Verrou tenant (domaine)** : le `customDomain` du tenant doit se terminer par `.gouv.fr`. C'est une exigence de la charte DSFR : le DSFR est réservé aux sites de l'État servis sur un domaine `.gouv.fr`.

Les deux verrous sont contrôlés à la fois côté UI (la sélection du thème DSFR dans l'admin `/admin/general` est désactivée tant que l'une des conditions manque, avec un message expliquant lequel) et côté serveur (le use case de sauvegarde rejette le thème DSFR si le `customDomain` n'est pas en `.gouv.fr`).

### Cohérence du couple thème / domaine

Une fois le DSFR actif sur un tenant, vous ne pouvez **plus retirer ni changer le `customDomain` vers un domaine non-`.gouv.fr`** : il faut d'abord repasser le tenant en thème Default. Le serveur renvoie une erreur explicite sinon. Cela garantit qu'un tenant en DSFR reste toujours servi sur un domaine `.gouv.fr`.

### Activation

1. Posez une `LICENSE_KEY` de plan `GOV_LICENSED`.
2. Configurez le `customDomain` du tenant en `.gouv.fr` (ex : `feedback.monministere.gouv.fr`) depuis `/admin/general`.
3. Sélectionnez le thème DSFR dans la section thème de `/admin/general`.

## Authentification

Sans configuration OAuth, la baseline fonctionne immédiatement : **mot de passe + magic link** (les deux nécessitent un SMTP fonctionnel, voir [Mailer](#mailer)).

### ProConnect

ProConnect (anciennement AgentConnect) est la fédération d'identité de l'État pour les agents publics. Le provider OIDC est activé uniquement si les **trois** variables sont posées. Si `OAUTH_PROCONNECT_CLIENT_ID` est défini sans `OAUTH_PROCONNECT_ISSUER`, le provider est **ignoré** (avec un avertissement dans les logs) pour éviter que la découverte OIDC plante l'authentification.

| Variable | Rôle |
|----------|------|
| `OAUTH_PROCONNECT_CLIENT_ID` | Identifiant client OIDC fourni par ProConnect |
| `OAUTH_PROCONNECT_CLIENT_SECRET` | Secret client OIDC |
| `OAUTH_PROCONNECT_ISSUER` | URL de l'issuer OIDC ProConnect (endpoint de découverte). Production : `https://auth.agentconnect.gouv.fr/api/v2` (vérifiez la valeur courante dans la documentation ProConnect, l'issuer évolue) |

> Posez les trois ou aucune. Une configuration partielle (clientId seul, ou clientId + secret sans issuer) laisse le provider inactif.

### Espace Membre (beta.gouv)

Pour les incubateurs beta.gouv, l'intégration Espace Membre permet de connecter les membres beta.gouv via leur compte. Les emails en `@beta.gouv.fr` et `@ext.beta.gouv.fr` sont vérifiés contre l'API Espace Membre au login (membre inactif = connexion bloquée ; membre actif sans compte local = compte créé avec `isBetaGouvMember`).

| Variable | Défaut | Rôle |
|----------|--------|------|
| `ESPACE_MEMBRE_API_KEY` | (vide) | Clé API Espace Membre |
| `ESPACE_MEMBRE_URL` | `https://espace-membre.incubateur.net` | URL de l'instance Espace Membre |

### OAuth optionnels

GitHub et Google restent disponibles si besoin (par exemple pour des contributeurs externes) :

| Variable | Rôle |
|----------|------|
| `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` | OAuth GitHub |
| `OAUTH_GOOGLE_CLIENT_ID` / `OAUTH_GOOGLE_CLIENT_SECRET` | OAuth Google |

Chaque provider OAuth doit aussi être activé explicitement par tenant (ou sur le domaine root) côté admin pour être proposé sur la page de connexion.

## Bootstrap d'une instance fraîche

L'image runner est un bundle Next.js standalone : `tsx` et `pnpm` n'y sont pas présents, donc **`prisma db seed` n'y tourne pas**. Le bootstrap d'une instance vierge se fait via la route HTTP `POST /api/setup`.

### Activation et sécurité

- La route est **désactivée par défaut** : sans `SETUP_TOKEN`, elle renvoie `403`.
- Posez `SETUP_TOKEN` (une valeur secrète forte, ex : `openssl rand -base64 32`) pour l'activer.
- Chaque appel doit fournir le header `x-setup-token: <SETUP_TOKEN>` (sinon `401`, comparaison à temps constant).
- La route est **idempotente** : si la base contient déjà un tenant, elle renvoie `409` sans rien créer.

### Corps de la requête

Le corps JSON est **optionnel** : tout champ absent retombe sur la variable `SEED_*` correspondante (voir [Seed](#variables-de-seed)).

| Champ JSON | Fallback env | Rôle |
|------------|--------------|------|
| `adminEmail` | `SEED_ADMIN_EMAIL` | Email de l'administrateur initial |
| `adminName` | `SEED_ADMIN_NAME` | Nom affiché de l'admin |
| `adminPassword` | `SEED_ADMIN_PASSWORD` | Mot de passe de l'admin (optionnel, voir ci-dessous) |
| `adminUsername` | `SEED_ADMIN_USERNAME` | Username de l'admin |
| `tenantName` | `SEED_TENANT_NAME` | Nom du premier tenant |
| `tenantSubdomain` | `SEED_TENANT_SUBDOMAIN` | Sous-domaine du premier tenant (`[a-z0-9-]+`) |

En cas de succès, la route renvoie `201` avec `{ ok, adminEmail, tenantId, loginUrl }`. Elle crée une organisation, un tenant, un administrateur (rôle OWNER) et les entités de bienvenue (un board + ses statuts).

### Exemple

```bash
curl -X POST https://instance.example/api/setup \
  -H "x-setup-token: $SETUP_TOKEN" \
  -H "content-type: application/json" \
  -d '{"adminEmail":"admin@monministere.gouv.fr","adminPassword":"un-mot-de-passe-fort"}'
```

### Connexion de l'admin

- Si vous **fournissez un `adminPassword`**, l'admin peut se connecter directement par mot de passe.
- Si vous **ne fournissez pas de mot de passe**, l'admin se connecte par **magic link** : un SMTP fonctionnel est alors indispensable (voir [Mailer](#mailer)).

> **Alternative hors image standalone** : si vous lancez le code depuis les sources (pas l'image GHCR), vous pouvez seeder une instance minimale avec `SEED_MINIMAL=1 pnpm prisma db seed` au lieu d'appeler `/api/setup`.

> **Après le bootstrap**, retirez `SETUP_TOKEN` de l'environnement (ou laissez-le : la route est de toute façon idempotente et renvoie `409` une fois l'instance initialisée).

## Mailer

Le SMTP sert aux magic links, invitations et notifications. Configuration :

| Variable | Défaut | Rôle |
|----------|--------|------|
| `MAILER_SMTP_HOST` | `127.0.0.1` | Hôte SMTP |
| `MAILER_SMTP_PORT` | `1025` | Port SMTP |
| `MAILER_SMTP_LOGIN` | (vide) | Login SMTP |
| `MAILER_SMTP_PASSWORD` | (vide) | Mot de passe SMTP |
| `MAILER_SMTP_SSL` | `false` | TLS/SSL |
| `MAILER_FROM_EMAIL` | (calculé) | Adresse d'expéditeur |

### Adresse d'expéditeur : à poser absolument

L'adresse `from` est résolue dans cet ordre :

1. `MAILER_FROM_EMAIL` si défini.
2. Sinon, le login SMTP (`MAILER_SMTP_LOGIN`).
3. Sinon, `noreply@<domaine de l'instance>` (dérivé de `NEXT_PUBLIC_SITE_URL`).

**Posez explicitement `MAILER_FROM_EMAIL` sur un email de votre domaine gouvernemental**, aligné avec vos enregistrements SPF/DKIM/DMARC. Sans cela, les magic links partent en spam ou sont rejetés par les serveurs de messagerie destinataires, et les agents ne peuvent plus se connecter. Format accepté : `"Nom affiché <noreply@monministere.gouv.fr>"` ou simplement `noreply@monministere.gouv.fr`.

## Branding

Personnalisation de l'en-tête, du bloc marque et de l'opérateur. En contexte gouvernemental, le bloc ministère (`République Française` et son ministère de rattachement) et le logo opérateur sont les leviers principaux.

| Variable | Défaut | Rôle |
|----------|--------|------|
| `NEXT_PUBLIC_BRAND_NAME` | `Roadmaps Faciles` | Nom du service |
| `NEXT_PUBLIC_BRAND_TAGLINE` | `Du feedback mutuel...` | Accroche |
| `NEXT_PUBLIC_BRAND_MINISTRY` | `République\nFrançaise` | Bloc marque de l'État (le `\n` force le retour à la ligne, ex : `Ministère\nde l'Exemple`) |
| `NEXT_PUBLIC_BRAND_OPERATOR_ENABLE` | `true` | Affiche le logo opérateur |
| `NEXT_PUBLIC_BRAND_OPERATOR_LOGO_URL` | `/img/roadmaps-faciles.png` | URL du logo opérateur |
| `NEXT_PUBLIC_BRAND_OPERATOR_LOGO_ALT` | `Roadmaps Faciles` | Texte alternatif du logo |
| `NEXT_PUBLIC_BRAND_OPERATOR_LOGO_ORIENTATION` | `vertical` | `horizontal` ou `vertical` |

## Pages légales

Les valeurs par défaut pointent vers Roadmaps Faciles et son hébergeur (Scalingo). **Un opérateur gouvernemental DOIT toutes les remplacer** : elles alimentent les pages `/mentions-legales`, `/politique-de-confidentialite` et `/cgu`.

| Variable | Défaut | Rôle |
|----------|--------|------|
| `NEXT_PUBLIC_LEGAL_PUBLISHER_NAME` | `Roadmaps Faciles` | Éditeur du site |
| `NEXT_PUBLIC_LEGAL_PUBLISHER_ADDRESS` | (vide) | Adresse de l'éditeur |
| `NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR` | `Le responsable légal...` | Directeur de la publication |
| `NEXT_PUBLIC_LEGAL_HOSTING_NAME` | `Scalingo SAS` | Nom de l'hébergeur |
| `NEXT_PUBLIC_LEGAL_HOSTING_ADDRESS` | `15 avenue du Rhin...` | Adresse de l'hébergeur |
| `NEXT_PUBLIC_LEGAL_HOSTING_CONTACT` | `support@scalingo.com` | Contact de l'hébergeur |
| `NEXT_PUBLIC_LEGAL_HOSTING_PRIVACY_URL` | (Scalingo) | URL de la politique de l'hébergeur |
| `NEXT_PUBLIC_LEGAL_CONTACT_EMAIL` | `contact@roadmaps-faciles.fr` | Email de contact public |
| `NEXT_PUBLIC_LEGAL_RGPD_EMAIL` | `rgpd@roadmaps-faciles.fr` | Email du délégué à la protection des données |

## Variables de seed

Valeurs par défaut du bootstrap (utilisées par `/api/setup` quand le corps JSON ne les fournit pas, et par `prisma db seed`).

| Variable | Défaut | Rôle |
|----------|--------|------|
| `SEED_ADMIN_NAME` | `Admin` | Nom de l'admin initial |
| `SEED_ADMIN_EMAIL` | `admin@example.com` | Email de l'admin initial |
| `SEED_ADMIN_USERNAME` | `admin` | Username de l'admin |
| `SEED_ADMIN_PASSWORD` | (vide) | Mot de passe (vide = connexion par magic link) |
| `SEED_TENANT_NAME` | `Le Site par Défaut` | Nom du premier tenant |
| `SEED_TENANT_SUBDOMAIN` | `default` | Sous-domaine du premier tenant |
| `SEED_MINIMAL` | `false` | Seed minimal (1 org + 1 tenant + 1 admin, sans données factices) hors image standalone |

## Stockage et résidence des données

Roadmaps Faciles utilise un stockage S3-compatible pour les fichiers uploadés (images, avatars). Pour la résidence des données en France, deux options principales :

- **Garage** (recommandé en self-host) : stockage S3-compatible léger, hébergé sur votre propre infrastructure. C'est le défaut du scénario [Docker Compose](hosting/docker-compose/).
- **Scaleway Object Storage** : stockage S3 managé avec régions en France (`fr-par`), pour garantir la résidence des données sur le territoire national.

| Variable | Rôle |
|----------|------|
| `STORAGE_PROVIDER` | `s3` (ou `noop` pour désactiver l'upload) |
| `STORAGE_S3_ENDPOINT` | Endpoint S3 (ex : `http://garage:3900`, ou l'endpoint Scaleway) |
| `STORAGE_S3_REGION` | Région (ex : `garage`, `fr-par`) |
| `STORAGE_S3_BUCKET` | Nom du bucket |
| `STORAGE_S3_ACCESS_KEY_ID` / `STORAGE_S3_SECRET_ACCESS_KEY` | Credentials S3 |
| `STORAGE_S3_KEY_PREFIX` | Préfixe de clé (optionnel, utile pour mutualiser un bucket) |
| `STORAGE_MAX_FILE_SIZE_MB` | Taille max par fichier (défaut `5`) |

Pour le détail du provisioning Garage (secret RPC, access keys, bucket auto-créé au premier boot), voir le scénario [Docker Compose](hosting/docker-compose/).

## Checklist conformité

Le secteur public impose des obligations réglementaires que l'hébergeur doit traiter avant la mise en production :

- [ ] **Accessibilité (RGAA)** : la page `/accessibilite` est livrée comme **placeholder déclarant l'état "non conforme"**. Vous devez réaliser un audit RGAA et compléter la déclaration d'accessibilité conforme avant la mise en service.
- [ ] **RGPD / CNIL** : renseigner toutes les variables `NEXT_PUBLIC_LEGAL_*`, désigner un DPO joignable via `NEXT_PUBLIC_LEGAL_RGPD_EMAIL`, et tenir à jour la politique de confidentialité (`/politique-de-confidentialite`).
- [ ] **Résidence des données** : héberger la base PostgreSQL et le stockage S3 en France ou dans l'UE (Garage auto-hébergé, ou Scaleway région `fr-par`).
- [ ] **Tracking CNIL-compatible** : si vous activez l'analytique, choisir une solution conforme (Matomo auto-hébergé sans cookie, ou désactiver le tracking avec `NEXT_PUBLIC_TRACKING_PROVIDER=noop`). Éviter les solutions transférant des données hors UE sans encadrement.
- [ ] **Pages légales** : mentions légales (`/mentions-legales`), CGU (`/cgu`), politique de confidentialité (`/politique-de-confidentialite`) renseignées avec les informations réelles de l'opérateur.
- [ ] **Secrets uniques par instance** : `SECURITY_JWT_SECRET`, `SECURITY_WEBHOOK_SECRET`, `INTEGRATION_ENCRYPTION_KEY`, `SETUP_TOKEN` générés et propres à votre instance (jamais réutilisés d'un exemple).
- [ ] **SMTP de production** : `MAILER_FROM_EMAIL` sur le domaine gouvernemental, aligné SPF/DKIM/DMARC.

## Récapitulatif des variables gouvernementales

| Domaine | Variables |
|---------|-----------|
| Licence | `LICENSE_KEY`, `LICENSING_SERVER_URL`, `INSTANCE_ID` |
| Bootstrap | `SETUP_TOKEN`, `SEED_*` |
| Auth | `OAUTH_PROCONNECT_CLIENT_ID`, `OAUTH_PROCONNECT_CLIENT_SECRET`, `OAUTH_PROCONNECT_ISSUER`, `ESPACE_MEMBRE_API_KEY`, `ESPACE_MEMBRE_URL` |
| Mailer | `MAILER_FROM_EMAIL` (+ `MAILER_SMTP_*`) |
| Branding | `NEXT_PUBLIC_BRAND_MINISTRY`, `NEXT_PUBLIC_BRAND_OPERATOR_*` |
| Légal | `NEXT_PUBLIC_LEGAL_*` |
| Stockage | `STORAGE_PROVIDER`, `STORAGE_S3_*` |
| Conformité | `NEXT_PUBLIC_TRACKING_PROVIDER` |
