#!/bin/sh
# Entrypoint pour apps/web sur Coolify.
# Gère :
#   - Création de la DB review par PR (via COOLIFY_PR_NUMBER)
#   - Prisma migrate deploy
#   - Seed automatique en review (uniquement si DB fraîchement créée)

set -eu
# pipefail n'est pas POSIX, mais BusyBox sh (Alpine) le supporte
( set -o pipefail 2>/dev/null ) && set -o pipefail

# prisma est dans le PATH via /opt/prisma-cli/node_modules/.bin (cf Dockerfile)
PRISMA="prisma"
# Pas de SCHEMA= explicite : on cd dans apps/web/ avant prisma migrate deploy pour que
# Prisma trouve prisma.config.ts (qui contient datasource.url = process.env.DATABASE_URL).
# Sans ça, Prisma 7 ne charge pas le config (cherché relativement au CWD) et plante
# avec "The datasource.url property is required" car le schema.prisma n'a pas d'url
# hardcoded.

# --- Review apps : création DB par PR ---
DB_FRESH=0
if [ -n "${COOLIFY_PR_NUMBER:-}" ] && [ -n "${REVIEW_DB_ADMIN_URL:-}" ] && [ -n "${REVIEW_DB_BASE_URL:-}" ]; then
  # Validation stricte : COOLIFY_PR_NUMBER doit être numérique pour éviter l'injection SQL
  case "$COOLIFY_PR_NUMBER" in
    ''|*[!0-9]*)
      echo "ERROR: COOLIFY_PR_NUMBER must be numeric, got '$COOLIFY_PR_NUMBER'" >&2
      exit 1
      ;;
  esac

  if ! command -v psql >/dev/null 2>&1; then
    echo "ERROR: psql introuvable mais création DB review demandée. Rebuild l'image avec INCLUDE_PSQL=1." >&2
    exit 1
  fi

  DB_NAME="rf_pr_${COOLIFY_PR_NUMBER}"
  echo "====== ENSURE REVIEW DB $DB_NAME ======"

  DB_EXISTS=$(psql "$REVIEW_DB_ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

  if [ "$DB_EXISTS" != "1" ]; then
    # Catch "already exists" pour gérer la race (deux containers concurrents au boot)
    if ! psql "$REVIEW_DB_ADMIN_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$DB_NAME\";" 2>&1; then
      DB_EXISTS_RECHECK=$(psql "$REVIEW_DB_ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
      if [ "$DB_EXISTS_RECHECK" != "1" ]; then
        echo "ERROR: failed to create review DB $DB_NAME" >&2
        exit 1
      fi
    else
      DB_FRESH=1
    fi
  fi

  export DATABASE_URL="${REVIEW_DB_BASE_URL}/${DB_NAME}?schema=public"
fi

# --- Prisma migrate deploy ---
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "====== PRISMA MIGRATE DEPLOY ======"
  ( cd apps/web && "$PRISMA" migrate deploy )
  echo "====== PRISMA MIGRATE DEPLOY FINISH ======"
fi

# --- Seed review uniquement sur DB fraîche ---
if [ -n "${COOLIFY_PR_NUMBER:-}" ] && [ "$DB_FRESH" = "1" ] && [ "${REVIEW_AUTO_SEED:-1}" = "1" ]; then
  echo "====== SEED REVIEW DB ======"
  if ! ( cd apps/web && "$PRISMA" db seed ); then
    echo "WARN: seed failed, review app starts with empty DB" >&2
  fi
fi

exec "$@"
