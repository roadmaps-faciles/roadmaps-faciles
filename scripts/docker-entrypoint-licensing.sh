#!/bin/sh
# Entrypoint pour apps/licensing sur Coolify.

set -eu
( set -o pipefail 2>/dev/null ) && set -o pipefail

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "====== PRISMA MIGRATE DEPLOY (licensing) ======"
  node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma
  echo "====== PRISMA MIGRATE DEPLOY (licensing) FINISH ======"
fi

exec "$@"
