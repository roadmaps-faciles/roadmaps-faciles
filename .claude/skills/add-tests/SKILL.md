---
name: add-tests
description: Ajouter des tests (unit, integration, DB, e2e) pour la feature en cours de developpement
---

# Ajout de tests pour la feature courante

Analyse la feature developpee dans la session/branche courante, determine les couches de tests pertinentes, propose des scenarios (dont des edge cases), et implemente les tests apres validation utilisateur.

## 1. Analyse de la feature

Identifie les fichiers modifies/crees sur la branche courante :

```bash
git diff dev --name-only
git log dev..HEAD --oneline
```

Classe les changements par categorie :
- **Use cases** (`src/useCases/`) → tests integration (`testi/`)
- **Utilitaires/modeles** (`src/lib/utils/`, `src/lib/model/`) → tests unitaires (`testu/`)
- **Repos Prisma** (`src/lib/repo/impl/`) → tests DB (`testdb/`)
- **Pages/composants/actions** (`src/app/`) → tests E2E (`teste2e/`)
- **Services** (`src/lib/services/`) → tests unitaires ou integration selon complexite

## 2. Evaluation des couches de tests

Pour chaque categorie de changements, evalue si des tests sont necessaires et pertinents :

### Tests unitaires (`testu/`)
- Fonctions pures, utilitaires, validations Zod, transformations de donnees
- Pas de mocks, pas de DB — logique isolee uniquement
- Conventions : `tests/testu/{domaine}/{nom}.test.ts`

### Tests integration (`testi/`)
- Use cases avec mocks in-memory des repos/services
- Teste le comportement metier (happy path + erreurs)
- Utilise les helpers `createMock*Repo()` et `fake*()` existants dans `tests/testi/helpers/`
- Conventions : `tests/testi/{domaine}/{UseCaseName}.test.ts`

### Tests DB (`testdb/`)
- Repos Prisma contre PostgreSQL reel (`DATABASE_URL_TEST`)
- Teste les requetes, relations, contraintes
- Utilise les helpers `createTestTenantWithSettings()` etc.
- Conventions : `tests/testdb/repos/{RepoClassName}.test.ts`

### Tests E2E (`teste2e/`)
- Flows utilisateur complets via Playwright
- Utilise les fixtures et le test-seed existants
- Projets Playwright : `root-auth`, `tenant-admin`, `tenant-mod`, `tenant-user`, `unauthenticated`, `mobile`, `setup`
- Conventions : `tests/teste2e/{feature}.spec.ts`

Resume dans un tableau :

| Couche | Fichiers concernes | Pertinence | Justification |
|--------|-------------------|------------|---------------|
| testu | ... | Oui/Non | ... |
| testi | ... | Oui/Non | ... |
| testdb | ... | Oui/Non | ... |
| teste2e | ... | Oui/Non | ... |

## 3. Proposition de scenarios

Pour chaque couche retenue, propose des scenarios de test :

### Scenarios principaux (happy path)
- Cas d'utilisation nominal pour chaque fonctionnalite ajoutee/modifiee

### Scenarios d'erreur
- Validations echouees (Zod, contraintes metier)
- Permissions insuffisantes (roles, tenant mismatch)
- Ressources introuvables

### Edge cases
- Valeurs limites (chaines vides, nombres negatifs, listes vides)
- Cas de concurrence (doublons, races)
- Donnees nullables ou optionnelles
- Multi-tenant : isolation entre tenants, domaines invalides
- Etats transitoires (entites supprimees, desactivees)

### Question utilisateur

Presente les scenarios proposes et demande :
1. Y a-t-il un scenario specifique additionnel a couvrir ?
2. Faut-il ajuster la priorite des couches de tests ?

Attend la validation avant d'implementer.

## 4. Implementation des tests

Pour chaque couche validee :

1. **Verifie les helpers existants** : parcours `tests/testi/helpers/`, `tests/testdb/`, `tests/teste2e/fixtures.ts` pour reutiliser les mocks et fixtures disponibles
2. **Cree les fichiers de test** en suivant les conventions du projet
3. **Implemente les scenarios valides** par l'utilisateur
4. **Lance les tests** pour verifier qu'ils passent :
   - Unit + integration : `pnpm test -- --run {chemin_du_test}`
   - DB : `pnpm test:db -- --run {chemin_du_test}`
   - E2E : `pnpm test:e2e -- {chemin_du_test}` (necessite dev server + services)

Regles d'implementation :
- Pas d'import de `describe`, `it`, `expect`, `vi` — Vitest globals actifs
- Utiliser les path aliases (`@/`, `@/utils/`, `@/prisma/`)
- Suivre le style et la structure des tests existants dans la meme couche
- Preferer les assertions precises (`toBe`, `toEqual`, `toContain`) aux assertions vagues (`toBeTruthy`)

## 5. Mise a jour du filtre CI

Verifie que `.github/filters.yml` couvre les nouveaux fichiers de test et les fichiers source testes :

- Si de nouveaux dossiers source sont testes (ex: `src/lib/new-module/`), ajouter les patterns dans le filtre `test-unit` ou `test-db` selon la couche
- Si de nouveaux dossiers de test sont crees, verifier qu'ils sont couverts par les patterns existants (`tests/testu/**`, `tests/testi/**`, etc.)
- Si les patterns existants couvrent deja les fichiers, ne rien modifier

Presenter les modifications proposees au filtre CI avant de les appliquer.

## 6. Verification

Lance les tests crees pour confirmer qu'ils passent tous :

```bash
pnpm test -- --run
```

Si des tests echouent, analyse l'implémentation qui est testé évaluer si le problème viens du test ou de l'implémentation. Demande moi de t'aider à pondérer si besoin. Puis corrige-les jusqu'a obtenir un passage complet.

Lance ensuite /verif.

## 7. Resume

Affiche un resume final :

| Couche | Fichiers crees | Scenarios | Status |
|--------|---------------|-----------|--------|
| testu | ... | N scenarios | OK/KO |
| testi | ... | N scenarios | OK/KO |
| testdb | ... | N scenarios | OK/KO |
| teste2e | ... | N scenarios | OK/KO |

- Tests totaux ajoutes : N
- Edge cases couverts : N
- Filtre CI : Modifie / Inchange
