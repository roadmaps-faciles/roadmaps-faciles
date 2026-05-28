# syntax=docker/dockerfile:1
#
# Image multi-usage :
#   - SaaS prod (roadmaps-faciles.fr) : déployée avec Dockerfile.licensing à côté
#   - Self-host (ADEME, AGPL) : déployée seule, sans licensing server
#     (apps/licensing est BSL 1.1 et chiffré git-crypt, indispo aux self-hosters).
#     Mode "gracieux sans clé" géré au runtime via getEffectiveLicenseKey().
#
# Build args :
#   INCLUDE_PSQL=1      Inclut postgresql-client dans l'image runner (review apps uniquement,
#                       pour permettre la création de DB par PR depuis l'entrypoint).
#                       Laisser à 0 en prod/staging pour économiser ~30 MB.

ARG NODE_VERSION=24-alpine

# --- base : pnpm + libs natives ---
# corepack enable crée les shims, la version pnpm est résolue depuis package.json#packageManager
# au premier appel pnpm dans un stage qui a copié package.json (deps + builder).
FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache libc6-compat openssl && corepack enable
WORKDIR /app

# --- deps : install des deps workspace pour web uniquement ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile \
  --filter=@roadmaps-faciles/web... \
  --filter=!@roadmaps-faciles/licensing

# --- builder : Next build standalone ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* sont inlinés au build, doivent être passés en --build-arg
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_BRAND_NAME
ARG NEXT_PUBLIC_TRACKING_PROVIDER
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_REPOSITORY_URL

# git commit hash inlined dans NEXT_PUBLIC_APP_VERSION_COMMIT par next.config.ts.
# Sans, le footer affiche "dev" au lieu du sha. SOURCE_VERSION historique Scalingo,
# SOURCE_COMMIT pour GHA/Coolify (cf next.config.ts qui accepte les 2).
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=${SOURCE_COMMIT}

# TODO: lazy-init du client pour ne pas dépendre d'env var au build.
ARG ESPACE_MEMBRE_API_KEY=fakesecret
ENV ESPACE_MEMBRE_API_KEY=${ESPACE_MEMBRE_API_KEY}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

# Workspace manifests requis par pnpm --filter même quand node_modules est déjà installé
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copies sélectives : invalide le cache uniquement quand le code pertinent change
COPY tsconfig.json eslint.config.ts turbo.json ./
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui

# Cache mount Prisma engines : évite re-téléchargement (~50 MB) à chaque build
RUN --mount=type=cache,id=prisma-engines,target=/root/.cache/prisma \
  pnpm --filter @roadmaps-faciles/web build

# --- runner : standalone bundle + Prisma CLI bundlé ---
FROM node:${NODE_VERSION} AS runner
ARG INCLUDE_PSQL=0
# Version pinnée sur celle d'apps/web/package.json — bumper ici aussi à chaque bump prisma.
ARG PRISMA_VERSION=7.8.0

# Info de build exposée au runtime (process.env côté server) :
# - SOURCE_COMMIT : sha git du commit déployé (sha-court = .substring(0, 7))
# - IMAGE_REF : nom de la branche/tag git utilisé pour le build (mouvant : suit les pushs)
# Affichables côté UI /admin/config.
ARG SOURCE_COMMIT
ARG IMAGE_REF
ENV SOURCE_COMMIT=${SOURCE_COMMIT}
ENV IMAGE_REF=${IMAGE_REF}

RUN apk add --no-cache libc6-compat openssl tini \
  && if [ "$INCLUDE_PSQL" = "1" ]; then apk add --no-cache postgresql17-client; fi

RUN mkdir -p /opt/prisma-cli && cd /opt/prisma-cli \
  && echo '{"private":true}' > package.json \
  && npm install --no-audit --no-fund --no-save "prisma@${PRISMA_VERSION}" \
  && rm -rf /root/.npm

ENV PATH=/opt/prisma-cli/node_modules/.bin:$PATH

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/prisma ./apps/web/prisma
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/prisma.config.ts ./apps/web/prisma.config.ts

RUN mkdir -p /app/node_modules/.bin /app/node_modules/@prisma \
  /app/apps/web/node_modules/.bin /app/apps/web/node_modules/@prisma \
  && ln -sf /opt/prisma-cli/node_modules/prisma /app/node_modules/prisma \
  && ln -sf /opt/prisma-cli/node_modules/prisma /app/apps/web/node_modules/prisma \
  && for d in /opt/prisma-cli/node_modules/@prisma/*; do \
  name=$(basename "$d"); \
  [ ! -e "/app/node_modules/@prisma/$name" ] && ln -sf "$d" "/app/node_modules/@prisma/$name" || true; \
  [ ! -e "/app/apps/web/node_modules/@prisma/$name" ] && ln -sf "$d" "/app/apps/web/node_modules/@prisma/$name" || true; \
  done \
  && ln -sf /opt/prisma-cli/node_modules/.bin/prisma /app/node_modules/.bin/prisma \
  && ln -sf /opt/prisma-cli/node_modules/.bin/prisma /app/apps/web/node_modules/.bin/prisma \
  && chown -RP nextjs:nodejs /opt/prisma-cli

COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/healthz > /dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
