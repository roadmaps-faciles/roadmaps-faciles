# Contributing to Roadmaps Faciles

Merci de votre intérêt pour Roadmaps Faciles ! Ce guide explique comment contribuer au projet.

## Licence

Ce projet utilise un modèle de **triple licence** (voir [LICENSING.md](./LICENSING.md)) :

- **AGPL v3** - Code principal (tout ce qui n'est pas dans `ee/` ou `gouv/`)
- **BSL 1.1** - Fonctionnalités entreprise (répertoires `ee/`)
- **Roadmaps Faciles Gov License** - Fonctionnalités administration publique (répertoires `gouv/`)

En soumettant une contribution, vous acceptez que votre code soit licencié sous la licence correspondant au répertoire cible. Si votre contribution touche plusieurs répertoires, chaque partie est licenciée sous la licence du répertoire dans lequel elle se trouve.

## Prérequis

- Node.js 24+ (voir `.nvmrc`)
- pnpm (voir `packageManager` dans `package.json`)
- PostgreSQL 18+
- Docker Compose (recommandé pour les services locaux)

## Installation

```bash
git clone https://github.com/roadmaps-faciles/roadmaps-faciles.git
cd roadmaps-faciles
pnpm install
cp apps/web/.env.development apps/web/.env.development.local
pnpm dev:fresh   # services Docker (fresh) + migrations + seed, en une commande
pnpm dev
```

## Workflow de contribution

1. **Ouvrez une issue** avant de commencer - utilisez les [templates d'issues](.github/ISSUE_TEMPLATE/) (Feature Request, Bug Report, ou Tâche technique).
2. **Créez une branche** depuis `dev` : `feat/ma-feature`, `fix/mon-bug`, `chore/ma-tache`.
3. **Développez** en suivant les conventions ci-dessous.
4. **Vérifiez** avant de soumettre :
   ```bash
   pnpm lint --fix
   pnpm build
   pnpm test
   ```
5. **Ouvrez une Pull Request** vers `main` avec une description claire.

## Conventions

### Code

- TypeScript strict, ESLint 9 flat config
- Imports triés automatiquement (plugin perfectionist) - `pnpm lint --fix` le fait
- Pas de default exports sauf les fichiers spéciaux Next.js (`page`, `layout`, `route`, etc.)
- Path aliases : `@/*` → `src/*`
- Validation : Zod v4
- UI : shadcn/ui (thème Default) ou DSFR (thème Gov) - voir les bridges dans `src/ui/bridge/`

### Commits

Format [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat(scope): ajouter le support OAuth Google
fix(auth): corriger la redirection 2FA
chore(deps): mettre à jour Prisma 7.1
docs(adr): ADR-0028 nouveau pattern
```

### Tests

| Couche | Répertoire | Usage |
|--------|-----------|-------|
| Unit | `tests/testu/` | Logique pure, schémas Zod, utilitaires |
| Intégration | `tests/testi/` | Use cases avec mocks in-memory |
| DB | `tests/testdb/` | Repos Prisma contre PostgreSQL |
| E2E | `tests/teste2e/` | Playwright, parcours utilisateur complets |

Ajoutez des tests pour toute nouvelle logique métier. Les tests UI sont optionnels mais appréciés.

### Structure des répertoires

```
src/lib/ee/       → Code BSL 1.1 (providers, integrations, tracking)
src/useCases/ee/  → Use cases BSL 1.1
src/gouv/         → Code Gov License (DSFR, dsfr-bootstrap)
src/lib/gouv/     → Lib Gov License (espace membre)
src/emails/gouv/  → Templates email Gov
```

Placez votre code dans le bon répertoire selon la licence cible. En cas de doute, demandez dans l'issue.

## Sécurité

**Ne pas ouvrir d'issue publique** pour les vulnérabilités. Voir [SECURITY.md](./SECURITY.md) pour la procédure de signalement.

## Contact

- Questions générales : [contact@roadmaps-faciles.fr](mailto:contact@roadmaps-faciles.fr)
- Sécurité : [security@roadmaps-faciles.fr](mailto:security@roadmaps-faciles.fr)
- Licensing : [licensing@roadmaps-faciles.fr](mailto:licensing@roadmaps-faciles.fr)
