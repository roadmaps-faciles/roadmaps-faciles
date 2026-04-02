web: node apps/web/.next/standalone/apps/web/server.js
postdeploy: echo "====== PRISMA MIGRATE DEPLOY ======" && npm install --prefix /tmp/prisma prisma @next/env && cd apps/web && NODE_PATH=/tmp/prisma/node_modules /tmp/prisma/node_modules/.bin/prisma migrate deploy && rm -rf /tmp/prisma && echo "====== PRISMA MIGRATE DEPLOY FINISH ======"
