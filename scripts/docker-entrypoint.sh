#!/bin/sh
# Entrypoint pour apps/web : Prisma migrate deploy au démarrage.

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

# --- Prisma migrate deploy ---
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "====== PRISMA MIGRATE DEPLOY ======"
  ( cd apps/web && "$PRISMA" migrate deploy )
  echo "====== PRISMA MIGRATE DEPLOY FINISH ======"
fi

exec "$@"
