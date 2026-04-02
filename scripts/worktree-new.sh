#!/bin/bash
# scripts/worktree-new.sh
#
# Crée un git worktree isolé pour travailler en parallèle avec Claude Code.
#
# Usage :
#   scripts/worktree-new.sh <branch-name> [options]
#
# Options :
#   --port <port>    Port custom (modifie PORT + NEXT_PUBLIC_SITE_URL)
#   --db             Crée une DB dédiée + prisma db push + seed
#   --from <branch>  Branche de base (défaut: dev)
#   --code, --vscode Ouvre VS Code dans le worktree
#   --skip-claude    Ne pas lancer Claude à la fin (lancé par défaut)
#
# Exemples :
#   scripts/worktree-new.sh feat/auth-2fa              # léger : DB partagée, port 3000
#   scripts/worktree-new.sh feat/auth-2fa --db          # DB dédiée, port 3000
#   scripts/worktree-new.sh feat/auth-2fa --port 3001   # DB partagée, port 3001
#   scripts/worktree-new.sh feat/auth-2fa --db --port 3001  # tout isolé
#   scripts/worktree-new.sh fix/hotfix --from main      # worktree depuis main
#   scripts/worktree-new.sh feat/ui --code              # ouvre VS Code après setup
#   scripts/worktree-new.sh feat/ui --skip-claude       # pas de lancement Claude auto
#
# Par défaut le worktree partage la DB et le port du repo principal.
# Utilise --db et/ou --port pour isoler quand nécessaire (sessions parallèles,
# migrations en cours, etc.).

set -euo pipefail

# --- Parse arguments ---
BRANCH=""
PORT=""
ISOLATED_DB=false
BASE_BRANCH="dev"
OPEN_VSCODE=false
SKIP_CLAUDE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      PORT="${2:?--port nécessite une valeur}"
      shift 2
      ;;
    --db)
      ISOLATED_DB=true
      shift
      ;;
    --from)
      BASE_BRANCH="${2:?--from nécessite une valeur}"
      shift 2
      ;;
    --code|--vscode)
      OPEN_VSCODE=true
      shift
      ;;
    --skip-claude)
      SKIP_CLAUDE=true
      shift
      ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    -*)
      echo "❌ Option inconnue : $1" >&2
      echo "   Utilise --help pour voir les options disponibles." >&2
      exit 1
      ;;
    *)
      if [ -z "$BRANCH" ]; then
        BRANCH="$1"
      else
        echo "❌ Argument inattendu : $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

if [ -z "$BRANCH" ]; then
  echo "Usage: $0 <branch-name> [--port <port>] [--db] [--from <branch>]" >&2
  exit 1
fi

# --- Chemins ---
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Ce script doit être exécuté depuis un dépôt git."
  exit 1
fi
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
# Extraire un nom court depuis le nom de branche (feat/auth-2fa → auth-2fa)
SHORT_NAME=$(echo "$BRANCH" | sed 's|.*/||')
WORKTREE_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-${SHORT_NAME}"
DB_NAME="roadmaps-faciles-${SHORT_NAME}"

# --- Vérifications ---
if [ -d "$WORKTREE_DIR" ]; then
  echo "❌ Le répertoire $WORKTREE_DIR existe déjà."
  echo "   Utilise: cd $WORKTREE_DIR && claude"
  exit 1
fi

# Vérifier que la branche n'est pas déjà checked out dans un autre worktree
if git worktree list --porcelain | awk -v b="$BRANCH" \
  '$1 == "branch" && $2 == ("refs/heads/" b) { found = 1 } END { exit found ? 0 : 1 }'; then
  echo "❌ La branche $BRANCH est déjà utilisée dans un worktree :"
  git worktree list
  exit 1
fi

# --- Création du worktree ---
echo "📁 Création du worktree depuis ${BASE_BRANCH}..."
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git worktree add "$WORKTREE_DIR" "$BRANCH"
else
  git worktree add -b "$BRANCH" "$WORKTREE_DIR" "$BASE_BRANCH"
fi

cd "$WORKTREE_DIR"

# --- Copie des fichiers de config locale (gitignored) ---
echo "📋 Copie des fichiers de config locale..."
LOCAL_CONFIG_FILES=(
  ".claude/settings.local.json"
  "CLAUDE.local.md"
  ".env.development.local"
  ".env.production.local"
)
for file in "${LOCAL_CONFIG_FILES[@]}"; do
  if [ -f "$REPO_ROOT/$file" ]; then
    mkdir -p "$(dirname "$file")"
    cp "$REPO_ROOT/$file" "$file"
    echo "   Copié: $file"
  fi
done

# --- .env.development.local : surcharge port + DB si demandé ---
if [ -n "$PORT" ] || [ "$ISOLATED_DB" = true ]; then
  echo -n "⚙️  Configuration de l'environnement ("
  [ -n "$PORT" ] && echo -n "port=${PORT}"
  [ -n "$PORT" ] && [ "$ISOLATED_DB" = true ] && echo -n ", "
  [ "$ISOLATED_DB" = true ] && echo -n "db=${DB_NAME}"
  echo ")..."

  if [ -f .env.development.local ]; then
    if [ "$ISOLATED_DB" = true ]; then
      sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/${DB_NAME}\"|" .env.development.local
      grep -q "^DATABASE_URL=" .env.development.local || echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/${DB_NAME}\"" >> .env.development.local
    fi
    if [ -n "$PORT" ]; then
      sed -i '' "s|^PORT=.*|PORT=${PORT}|" .env.development.local
      sed -i '' "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:${PORT}|" .env.development.local
      sed -i '' "s|^AUTH_URL=.*|AUTH_URL=http://localhost:${PORT}/api/auth|" .env.development.local
      grep -q "^PORT=" .env.development.local || echo "PORT=${PORT}" >> .env.development.local
      grep -q "^NEXT_PUBLIC_SITE_URL=" .env.development.local || echo "NEXT_PUBLIC_SITE_URL=http://localhost:${PORT}" >> .env.development.local
      grep -q "^AUTH_URL=" .env.development.local || echo "AUTH_URL=http://localhost:${PORT}/api/auth" >> .env.development.local
    fi
  else
    # Pas de fichier source — créer un minimal
    {
      echo "# Worktree: $BRANCH"
      [ "$ISOLATED_DB" = true ] && echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/${DB_NAME}\""
      [ -n "$PORT" ] && echo "PORT=${PORT}"
      [ -n "$PORT" ] && echo "NEXT_PUBLIC_SITE_URL=http://localhost:${PORT}"
      [ -n "$PORT" ] && echo "AUTH_URL=http://localhost:${PORT}/api/auth"
    } > .env.development.local
  fi
fi

# --- Base de données (seulement si --db) ---
if [ "$ISOLATED_DB" = true ]; then
  echo "🗄️  Préparation de la base de données..."
  if PGPASSWORD=postgres psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "   DB $DB_NAME existe déjà, skip."
  else
    PGPASSWORD=postgres createdb -h localhost -U postgres "$DB_NAME" 2>/dev/null && echo "   DB $DB_NAME créée." || echo "   ⚠️  Impossible de créer la DB $DB_NAME. Crée-la manuellement."
  fi
fi

# --- Dépendances ---
echo "📦 Installation des dépendances..."
pnpm install --frozen-lockfile

# --- Prisma ---
echo "🔧 Génération du client Prisma..."
pnpm prisma generate

if [ "$ISOLATED_DB" = true ]; then
  echo "🔧 Prisma migrate deploy..."
  pnpm prisma migrate deploy 2>/dev/null || echo "   ⚠️  prisma migrate deploy a échoué — lance-le manuellement si le schéma a changé."
  echo "🌱 Seed de la base..."
  pnpm prisma db seed 2>/dev/null || echo "   ⚠️  Seed a échoué — lance 'pnpm prisma db seed' manuellement si nécessaire."
fi

# --- Résumé ---
echo ""
echo "✅ Worktree prêt !"
echo ""
echo "   Répertoire : $WORKTREE_DIR"
echo "   Branche    : $BRANCH (depuis ${BASE_BRANCH})"
if [ -n "$PORT" ]; then
  echo "   Port       : $PORT"
else
  echo "   Port       : 3000 (partagé)"
fi
if [ "$ISOLATED_DB" = true ]; then
  echo "   Base       : $DB_NAME (dédiée)"
else
  echo "   Base       : partagée avec le repo principal"
fi
echo ""

# --- Ouverture VS Code ---
if [ "$OPEN_VSCODE" = true ]; then
  echo "💻 Ouverture de VS Code..."
  code "$WORKTREE_DIR"
fi

# --- Lancement Claude ou cd dans le worktree ---
if [ "$SKIP_CLAUDE" = true ]; then
  echo "👉 cd $WORKTREE_DIR"
  echo ""
  cd "$WORKTREE_DIR" && exec "$SHELL"
else
  echo "🤖 Lancement de Claude..."
  echo ""
  cd "$WORKTREE_DIR" && exec claude
fi
