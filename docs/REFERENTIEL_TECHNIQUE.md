# Référentiel Technique — Annuaire Hyperlocal Artisans

> Dernière mise à jour : 18 février 2026

---

## Stack technique

### Framework

**Next.js 15 (App Router)**

- SSR/SSG natif → SEO critique pour un annuaire
- Full-stack en un seul repo (API Routes + Server Actions)
- Écosystème mature, déploiement Vercel frictionless

### Base de données

**PostgreSQL** (via Supabase ou Neon pour l'hébergement)

- Structure relationnelle adaptée (Artisan ↔ Métier ↔ Commune)
- Scalable, requêtes géographiques possibles (PostGIS)

### ORM

**Prisma**

- Typage fort bout en bout
- Migrations versionnées
- Prisma Studio pour admin rapide en dev

### Validation

**Zod**

- Schémas partagés client/serveur
- Intégration native avec React Hook Form

### Email transactionnel

**Resend**

- API simple, bon free tier
- Templates React Email

### Authentification (admin)

**NextAuth v5**

- Session admin sécurisée
- Provider credentials suffit pour V1 (1-2 admins)

### UI & Styling

**Tailwind CSS v4 + composants custom**

- Pas de composant library générique (Material UI, Bootstrap)
- Design system "bande dessinée" : custom uniquement
- Polices expressives : [Bangers](https://fonts.google.com/specimen/Bangers) (titres BD) + [Nunito](https://fonts.google.com/specimen/Nunito) (corps de texte)
- Palette : couleurs franches et chaudes (jaune #FFD93D, rouge #FF6B6B, bleu nuit #1A1A2E, blanc cassé #FFF8F0)
- Ombres portées marquées, bordures épaisse, effets "case de BD"

### Tests

**Vitest + Testing Library + Playwright**

- Vitest : tests unitaires (logique métier, validators)
- Testing Library : tests composants React
- Playwright : tests E2E (parcours critiques : recherche + formulaire contact)

### Linting / Formatting

- ESLint (config Next.js + règles strictes)
- Prettier
- Husky + lint-staged (pre-commit)

### CI/CD

**GitHub Actions**

- Pipeline : lint → typecheck → tests → build
- Déploiement automatique sur Vercel (branche `main`)
- Preview deployments sur PRs

---

## Architecture applicative

```
src/
├── app/                    # App Router Next.js
│   ├── (public)/           # Routes publiques
│   │   ├── page.tsx        # Accueil
│   │   ├── artisans/       # Liste + fiche
│   │   └── inscription/    # Formulaire artisan
│   ├── admin/              # Back-office (protégé)
│   └── api/                # API Routes (contact, inscription)
├── components/
│   ├── ui/                 # Composants design system BD
│   └── features/           # Composants métier
├── lib/
│   ├── db/                 # Client Prisma
│   ├── email/              # Templates + envoi Resend
│   ├── validators/         # Schémas Zod
│   └── utils/              # Helpers purs
├── types/                  # Types TypeScript partagés
└── constants/              # Constantes (métiers, communes, etc.)

prisma/
├── schema.prisma
└── migrations/

docs/                       # Documentation projet
scripts/tmp/                # Scripts ponctuels (vidé à chaque étape)
```

---

## Modèle de données (schéma Prisma — initial)

```prisma
model Artisan {
  id            String    @id @default(cuid())
  raisonSociale String
  siret         String?   @unique
  prenom        String
  nom           String
  email         String    @unique
  telephone     String?
  siteWeb       String?
  description   String?   @db.VarChar(500)
  status        ArtisanStatus @default(EN_ATTENTE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // soft delete

  metiers       ArtisanMetier[]
  communes      ArtisanCommune[]
  contacts      ContactRequest[]
}

model Metier {
  id       String          @id @default(cuid())
  slug     String          @unique
  label    String
  artisans ArtisanMetier[]
}

model Commune {
  id       String           @id @default(cuid())
  nom      String
  codePostal String
  artisans ArtisanCommune[]
}

model ArtisanMetier {
  artisan   Artisan @relation(fields: [artisanId], references: [id])
  artisanId String
  metier    Metier  @relation(fields: [metierId], references: [id])
  metierId  String
  @@id([artisanId, metierId])
}

model ArtisanCommune {
  artisan   Artisan @relation(fields: [artisanId], references: [id])
  artisanId String
  commune   Commune @relation(fields: [communeId], references: [id])
  communeId String
  @@id([artisanId, communeId])
}

model ContactRequest {
  id          String   @id @default(cuid())
  artisan     Artisan  @relation(fields: [artisanId], references: [id])
  artisanId   String
  clientPrenom String
  clientNom   String
  clientEmail String
  clientTel   String?
  message     String   @db.VarChar(1000)
  typeTraux   String
  createdAt   DateTime @default(now())
}

enum ArtisanStatus {
  EN_ATTENTE
  VALIDE
  REJETE
}
```

---

## Décisions d'architecture

Voir le dossier `docs/ADR/` pour le détail de chaque décision.

| ADR     | Sujet                              | Statut    |
| ------- | ---------------------------------- | --------- |
| ADR-001 | Choix du framework (Next.js)       | à rédiger |
| ADR-002 | Choix de la DB (PostgreSQL)        | à rédiger |
| ADR-003 | Stratégie d'authentification admin | à rédiger |

---

## Variables d'environnement requises

```env
# Base de données
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
```

---

## Performance & SEO

- Pages artisans : **SSG** avec revalidation ISR (toutes les heures)
- Fiche artisan : **SSG** par slug, revalidation à la validation
- Sitemap dynamique généré automatiquement
- Métadonnées OpenGraph sur chaque fiche
- Core Web Vitals : LCP < 2.5s, CLS < 0.1 (objectif)
