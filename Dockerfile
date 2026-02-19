FROM node:22-alpine AS base

# ── Dépendances ────────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Génère le client Prisma
RUN npx prisma generate

# Variables factices pour que next build ne plante pas sans les vraies valeurs
ENV NEXTAUTH_SECRET=build-placeholder
ENV NEXTAUTH_URL=http://localhost:3000
ENV AUTH_SECRET=build-placeholder
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

RUN npm run build

# ── Runner ─────────────────────────────────────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# HOME=/tmp permet à npx d'écrire le cache npm sans répertoire home (user système)
ENV HOME=/tmp

# Utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Fichiers publics
COPY --from=builder /app/public ./public

# Uploads persistents (le volume Docker sera monté ici)
RUN mkdir -p ./public/uploads/besoins && chown nextjs:nodejs ./public/uploads/besoins

# Build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schéma Prisma pour les migrations au démarrage
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Constantes nécessaires pour le seed (prisma/seed.ts importe ../src/constants)
COPY --from=builder /app/src/constants ./src/constants
# node_modules complet pour que prisma migrate deploy fonctionne (@prisma/dev + toutes ses dépendances)
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Lance les migrations Prisma puis démarre l'app
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
