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

# Schéma Prisma + config Prisma 7 pour les migrations au démarrage
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# CLI Prisma (évite de télécharger via npx à chaque démarrage)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# dotenv requis par prisma.config.ts
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

USER nextjs

EXPOSE 3000

# Lance les migrations puis démarre l'app
# node_modules/prisma/build/index.js est le vrai point d'entrée (évite le problème de symlink .bin/)
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then node node_modules/prisma/build/index.js migrate deploy; else echo 'WARNING: DATABASE_URL not set, skipping migrations'; fi && node server.js"]
