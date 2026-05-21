# Multi-tenancy & Auth

## Routing multi-tenant

Routing par domaine via `src/app/[domain]/`. Le proxy `src/proxy.ts` génère un correlation ID, injecte `x-pathname` et `x-forwarded-host`, et propage les headers de tenant. `getDomainFromHost()` dans `src/lib/utils/tenant.ts` lit `x-forwarded-host` puis `host`, et normalise `0.0.0.0` en `localhost` (voir aussi `docs/gotchas.md`).

Utilitaires tenant : `src/lib/utils/tenant.ts` expose `getDomainFromHost()`, `getTenantFromDomain()`, `getTenantSubdomain()`. Les server actions n'ont jamais besoin d'un param `domain` explicite, elles lisent le host depuis les headers.

Types réutilisables : `DomainParams` / `DomainProps` exportés depuis `src/app/[domain]/(default)/layout.tsx`. Pages tenant wrappées par `DomainPageHOP` (`src/app/[domain]/(default)/DomainPage.tsx`) qui injecte tenant + settings.

## Auth

NextAuth v5 beta (`src/lib/next-auth/`), JWT sessions, plusieurs providers Credentials.

- **Password (primaire)** : provider `"password"`, argon2 + email verification obligatoire. Code dans `src/lib/utils/password.ts` (server-only) + `src/lib/utils/passwordConstants.ts` (client-safe). Signup : `src/useCases/users/SignupWithPassword.ts` crée user + envoie verification email via `VerificationToken`. Reset password : `src/lib/utils/verificationToken.ts` réutilise `VerificationToken` avec prefixes `verify:{email}` / `reset:{email}`.
- **Espace Membre (secondaire)** : `/login/espace-membre`, agents publics français.
- **Magic link (tertiaire)** : `/login/passwordless`.
- **SSO Bridge** : `src/lib/authBridge.ts`, transfert HMAC root → tenant via provider Credentials `"bridge"`. Vérifie `UserOnTenant` avant d'émettre le token ; non-membres redirigés vers tenant login avec `?from=root` pour bridge signup.
- **OAuth SSO** : GitHub, Google, ProConnect côté root + tenant. Config via `OAUTH_*` env vars dans `src/config.ts`. Root providers toggle via `AppSettings.rootOAuthProviders` (page `/admin/authentication`), tenant providers via `TenantDefaultOAuth`.
- **2FA** : passkey (WebAuthn), OTP (TOTP), email. APIs sous `src/app/(default)/api/ee/{webauthn,otp,2fa}/`. Vérification via proof Redis (`2fa:proof:{userId}`, TTL 60s) consommée par le JWT callback sur `session.update()`. Force 2FA admin avec grace period 0 à 5 jours stockée dans `User.twoFactorDeadline`.

## Rôles et accès

- `assertTenantAdmin(domain)` et `assertTenantModerator(domain)` dans `src/lib/utils/auth.ts`, type `TenantAccessCheck = { domain: string } & AccessCheck`. La modération a son propre arbre `/moderation` (séparé de `/admin`).
- `checkTenantUser()` a un bypass super admin defense-in-depth (le bypass primaire est dans `assertSession()`).
- Helpers session : `isSessionAdmin()` / `isSessionModerator()` dans `src/lib/utils/sessionRoles.ts`, partagés entre `ShadcnUserHeaderItem` (Default) et `AuthHeaderItems` (DSFR) pour éviter le drift.

## Layouts

`DefaultAuthenticatedLayout` lit le header `x-pathname` (posé par `src/proxy.ts`) pour gérer la redirect loop prevention entre `2fa-setup` et `2fa-verify`.

## Seed

`setSeedTenant()` / `getSeedTenant()` dans `src/lib/seedContext.ts`, réservés aux scripts de seed.
