---
name: check-review-pr
description: Review PR comments and suggestions, evaluate relevance, apply fixes, then run verification
---

# Revue des commentaires de PR

Analyse les commentaires et reviews de la PR en cours, evalue leur pertinence, applique les corrections necessaires, puis lance la verification.

## 1. Identification de la PR

Detecte la PR associee a la branche courante :

```bash
gh pr view --json number,title,url,state
```

Si aucune PR n'est trouvee, informe l'utilisateur et arrete.

## 2. Recuperation des reviews et commentaires

Recupere tous les commentaires et reviews de la PR :

```bash
gh pr view --json reviews,comments
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

Classe-les par type :
- **Review comments** (inline sur du code)
- **PR comments** (discussion generale)
- **Review verdicts** (approved, changes_requested, commented)

## 3. Analyse detaillee de chaque commentaire

Pour chaque commentaire ou suggestion :

1. **Contexte** : lis le fichier et les lignes concernees pour comprendre le contexte complet
2. **Pertinence** : evalue si le commentaire est pertinent (bug reel, amelioration justifiee, convention du projet) ou non (preference stylistique sans impact, malentendu, deja gere)
3. **Classification** :
   - Si commentaire de Copilot ou autre outil d'IA → mesurer sur 100% la pertinence du commentaire, corriger si pertinent, sinon a ignorer avec justification
   - Pertinent et actionnable → a corriger
   - Pertinent mais discutable → a signaler pour decision
   - Non pertinent → a ignorer avec justification
4. **Suggestion de code** (`suggestion` blocks dans GitHub) : extrais le diff suggere et evalue-le

## 4. Application des corrections

Pour chaque commentaire classe "a corriger" :

1. Applique la correction dans le code
2. Verifie que la correction ne casse rien dans le contexte environnant
3. Note la correction effectuee

Ne fais PAS de corrections pour les commentaires classes "discutables" ou "non pertinents" sans validation explicite de l'utilisateur.

## 5. Resume intermediaire

Avant de lancer la verification, affiche un rapport detaille :

### Tableau des commentaires

Pour chaque commentaire, affiche :
- **Auteur** et **date**
- **Fichier:ligne** concerne (si inline)
- **Resume** du commentaire
- **Verdict** : Corrige / Discutable / Ignore
- **Justification** du verdict

### Question pour l'utilisateur
- Pour les commentaires discutables, propose des suggestions d'implémentation ou non, et demande une decision.

### Statistiques
- Nombre total de commentaires
- Commentaires corriges
- Commentaires discutables (en attente de decision)
- Commentaires ignores

## 6. Verification

Lance le skill `verif` pour valider que les corrections n'introduisent pas de regressions.

## 7. Finalisation
- Une fois un commentaire adressé, "resolve" le thread sur GitHub :
  1. D'abord, poster un commentaire de réponse via `gh api` (REST) indiquant la correction effectuée ou la raison de l'ignorance
  2. Ensuite, résoudre le thread via l'API GraphQL (les réponses REST ne résolvent pas les threads) :
     ```bash
     # Récupérer les IDs des threads non résolus
     gh api graphql -f query='{
       repository(owner: "OWNER", name: "REPO") {
         pullRequest(number: NUMBER) {
           reviewThreads(first: 50) {
             nodes { id isResolved }
           }
         }
       }
     }' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false) | .id'

     # Résoudre chaque thread
     gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "THREAD_ID"}) { thread { isResolved } } }'
     ```
- Si copilot, tag le pour qu'il apprenne de ses erreurs ou de ses suggestions pertinentes. Précise lui qu'il ne faut absolument pas créer de PR ! ATTENTION : ne jamais mentionner le bot `@copilot-pull-request-reviewer` dans les commentaires, cela déclenche des actions automatiques indésirables (création de PR, boucles de review) — utiliser des mentions génériques (`@copilot`) ou aucune mention pour parler de Copilot.
