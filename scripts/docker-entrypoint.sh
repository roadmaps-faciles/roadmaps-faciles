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
SCHEMA="apps/web/prisma/schema.prisma"

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
  "$PRISMA" migrate deploy --schema "$SCHEMA"
  echo "====== PRISMA MIGRATE DEPLOY FINISH ======"
fi

# --- Seed review uniquement sur DB fraîche ---
if [ -n "${COOLIFY_PR_NUMBER:-}" ] && [ "$DB_FRESH" = "1" ] && [ "${REVIEW_AUTO_SEED:-1}" = "1" ]; then
  echo "====== SEED REVIEW DB ======"
  if ! "$PRISMA" db seed --schema "$SCHEMA"; then
    echo "WARN: seed failed, review app starts with empty DB" >&2
  fi
fi

exec "$@"
