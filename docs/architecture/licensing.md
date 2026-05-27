# Licensing (Self-host)

Vérification offline Ed25519 + refresh online 24h + grace period 7 jours. Code : `src/lib/ee/licensing/`.

## Fichiers clés

- `licenseVerifier.ts` : dupliqué intentionnellement depuis `apps/licensing/` (~30 lignes, pas de package partagé).
- `licenseService.ts` : singleton, expose `getLicenseStatus()` (async, refresh) et `getCachedLicenseStatus()` (sync).
- `publicKey.ts` : public key Ed25519 embedded (NOT a secret).

## Modes

Détection cloud vs self-host : `!config.licenseKey` (string vide par défaut = cloud), **PAS** `status.mode`.

- **Cloud** (`config.licenseKey` empty) : pas de license check, features pilotées par les `OrgAddon` Stripe.
- **Self-host** (`config.licenseKey` truthy) : license validée, déverrouille **toutes** les features EE en all-or-nothing. Le plan `GOV_LICENSED` déverrouille en plus `THEME_DSFR`.

## Config

Variables dans `src/config.ts` :
- `LICENSE_KEY` : la license signée Ed25519
- `LICENSING_SERVER_URL` : endpoint de refresh online
- `INSTANCE_ID` : identifiant unique de l'instance pour le tracking côté serveur de licensing

## Serveur de licensing

L'app `apps/licensing/` (entièrement chiffrée git-crypt, BSL 1.1) est un serveur Hono qui :
- Signe les licenses avec Ed25519 (clé privée non versionnée)
- Gère Stripe pour les souscriptions self-host
- Stocke les licenses dans une DB Postgres séparée (`licensing`)
- Expose un endpoint de refresh pour les instances self-host
