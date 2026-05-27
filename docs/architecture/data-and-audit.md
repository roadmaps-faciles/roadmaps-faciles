# Data layer & Audit log

## Data layer

- Prisma repos : `src/lib/repo/`
- Services : `src/lib/services/`
- Use cases : `src/useCases/`

Pattern classique : route handler / server action → use case → repos + services. Les use cases ne dépendent pas de Prisma directement, ils passent par les repos (testabilité avec in-memory mocks).

## Audit log

Fire-and-forget `audit()` dans `src/lib/utils/audit.ts`.

### Pattern dans les server actions

Appeler `getRequestContext()` **avant** le try/catch et avant les early returns de validation. Ensuite appeler `audit()` sur trois chemins :
- Succès
- Catch d'exception
- Early return de validation

`RequestContext` inclut `correlationId` (depuis le header proxy).

### Types

- `AuditInput.metadata` accepte `Record<string, unknown>`. Le cast vers `Prisma.InputJsonValue` se fait en interne dans `audit()`.
- Les TS interfaces n'ont pas de signature index implicite. Pour convertir une interface en `Record<string, unknown>`, faire un spread `{ ...obj }`.

### Schéma

`AuditLog` Prisma n'a **pas** de FK intentionnellement. Les logs survivent aux suppressions de user / tenant. Batch user lookup via Map dans le repo pour éviter les N+1.

### Règle

Toute server action ou route handler qui fait une mutation (create / update / delete / security change) **DOIT** appeler `audit()`. Vérifier les valeurs existantes dans l'enum `AuditAction` et proposer de nouvelles valeurs si nécessaire.
