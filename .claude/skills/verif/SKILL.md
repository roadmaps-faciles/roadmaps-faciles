---
name: verif
description: Verify implementation by running lint, TypeScript diagnostics, and checking for errors
---

# Verification de l'implementation

Effectue les verifications suivantes dans l'ordre :

## 1. ESLint

Lance `pnpm lint --fix` pour corriger automatiquement les erreurs de formatage et de tri des imports, puis verifie qu'il n'y a plus d'erreurs. Sauf evidement si il est passé litéralement juste avant.

Si des erreurs persistent apres le `--fix`, corrige-les manuellement.

## 2. Vérification post-implementation

Fais une revue approfondie de l'implementation pour verifier que les changements sont conformes aux attentes, que les fonctionnalités sont bien implementées, et que le code est propre et maintenable. Tu peux uiliser le MCP `feature-dev:code-reviewer` (et d'autres si besoin) pour t'assister dans cette revue, en incluant un build de contrôle à la fin pour verifier que le projet compile correctement.

## 3. Issues mineures hors scope

Si la revue (étape 3) relève des issues mineures **hors du scope direct** de la session (bugs pré-existants, limitations techniques, améliorations cosmétiques repérées dans le code voisin), utilise `AskUserQuestion` pour les présenter **interactivement** avec des propositions de correction :

Pour chaque issue trouvée :
- Affiche le fichier, la ligne, la description courte, la sévérité et **la correction proposée** (extrait de code avant/après)
- Utilise `AskUserQuestion` avec des suggestions cliquables : `["Corrige tout", "Corrige seulement #1, #3", "Ignore tout"]` (adapte les numéros aux issues trouvées)
- Si l'utilisateur valide (tout ou partie), applique les corrections et relance lint + build
- Si l'utilisateur refuse, note-les dans le résumé comme "non corrigées (hors scope)"

## 4. Resume

A la fin, affiche un resume clair :
- Nombre de fichiers verifies
- Erreurs ESLint trouvees et corrigees (ou aucune)
- Rapport de verification post-implementation
- Issues mineures hors scope proposees et leur statut (corrigees / refusees / aucune)
- Statut final : OK ou KO avec details
