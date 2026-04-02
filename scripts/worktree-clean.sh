#!/bin/bash
# scripts/worktree-clean.sh
#
# Supprime un git worktree et optionnellement sa base de données dédiée.
#
# Usage :
#   scripts/worktree-clean.sh <branch-name> [--drop-db]
#
# Exemples :
#   scripts/worktree-clean.sh feat/auth-2fa            # supprime le worktree, garde la DB
#   scripts/worktree-clean.sh feat/auth-2fa --drop-db   # supprime worktree + DB

set -euo pipefail

# --- Arguments ---
BRANCH="${1:?Usage: $0 <branch-name> [--drop-db]}"
DROP_DB="${2:-}"

# --- Chemins ---
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Ce script doit être exécuté depuis un dépôt git." >&2
  exit 1
fi
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
SHORT_NAME=$(echo "$BRANCH" | sed 's|.*/||')
WORKTREE_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-${SHORT_NAME}"
DB_NAME="roadmaps-faciles-${SHORT_NAME}"

# --- Vérifications ---
if [ ! -d "$WORKTREE_DIR" ]; then
  echo "❌ Le répertoire $WORKTREE_DIR n'existe pas."
  echo ""
  echo "Worktrees existants :"
  git worktree list
  exit 1
fi

# --- Suppression du worktree ---
echo "🗑️  Suppression du worktree $WORKTREE_DIR..."
# --force seul ne supprime pas les fichiers ignorés (node_modules, .next, generated…)
# On tente d'abord proprement, puis on supprime le répertoire manuellement si besoin
if ! git worktree remove "$WORKTREE_DIR" --force 2>/dev/null; then
  echo "   ⚠️  git worktree remove a échoué (fichiers non trackés), suppression manuelle..."
  rm -rf "$WORKTREE_DIR"
  git worktree prune
fi

# Nettoyer la branche locale si elle a été mergée
if git branch --merged dev --format='%(refname:short)' 2>/dev/null | grep -Fxq "$BRANCH"; then
  echo "🌿 La branche $BRANCH est mergée dans dev, suppression..."
  git branch -d "$BRANCH" 2>/dev/null || true
else
  echo "ℹ️  La branche $BRANCH n'est pas mergée — conservée."
fi

# --- Suppression de la DB (optionnel) ---
if [ "$DROP_DB" = "--drop-db" ]; then
  if PGPASSWORD=postgres psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "🗄️  Suppression de la base $DB_NAME..."
    PGPASSWORD=postgres dropdb -h localhost -U postgres "$DB_NAME" 2>/dev/null && echo "   DB $DB_NAME supprimée." || echo "   ⚠️  Impossible de supprimer la DB $DB_NAME."
  else
    echo "ℹ️  Pas de DB dédiée $DB_NAME trouvée (worktree utilisait la DB partagée)."
  fi
fi

# --- Prune ---
git worktree prune

echo ""
echo "✅ Nettoyage terminé."
echo ""
echo "Worktrees restants :"
git worktree list
