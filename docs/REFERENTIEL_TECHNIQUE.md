# Référentiel Technique — Annuaire Hyperlocal Artisans

> Dernière mise à jour : 20 février 2026 — RGPD, uploads DB, Coolify/Hetzner, fond role-aware

---

## Stack technique

### Framework

**Next.js 15 (App Router)**

- SSR/SSG natif → SEO critique pour un annuaire
- Full-stack en un seul repo (API Routes + Server Actions)
- Écosystème mature, déploiement Vercel frictionless

### Base de données

**PostgreSQL** — hébergée sur Hetzner VPS via Coolify (conteneur Docker)

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

### Authentification

**NextAuth v5 (beta)**

- Rôles JWT : `admin` | `artisan` | `particulier`
- Provider credentials pour admin et artisan (email + password hash)
- Provider OAuth Google (artisan)
- Homepage différenciée selon rôle (3 vues)
- Session étendue : `id`, `role`, `prenom`

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

**Coolify (auto-deploy via webhook GitHub)**

- Push sur `main` → webhook → build Docker sur le VPS Hetzner → deploy
- Webhook URL : `http://37.27.222.18:8000/webhooks/source/github/events/manual`
- Pas de GitHub Actions pour l'instant (CI/CD Coolify suffit pour le MVP)
- Pipeline de build : `prisma migrate deploy` + `prisma generate` + `next build` + `next start`

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
  id              String        @id @default(cuid())
  raisonSociale   String?
  siret           String?       @unique
  prenom          String
  nom             String
  email           String        @unique
  telephone       String?
  siteWeb         String?
  logoUrl         String?       // URL du logo
  description     String?       @db.VarChar(500)
  passwordHash    String?       // null = artisan sans compte (flux token)
  status          ArtisanStatus @default(EN_ATTENTE)
  hasPendingDraft Boolean       @default(false)
  draftData       Json?         // modifications en attente
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?     // soft delete

  metiers       ArtisanMetier[]
  communes      ArtisanCommune[]
  contacts      ContactRequest[]
  editTokens    EditToken[]
  avis          Avis[]
  oauthAccounts OAuthAccount[]
}

model Besoin {
  id          String   @id @default(cuid())
  artisanId   String?  // lien optionnel vers le compte particulier
  metierSlug  String
  commune     String
  description String   @db.VarChar(1000)
  prenom      String
  contact     String?  // optionnel
  photos      Json?    // tableau d'URLs (max 6)
  status      String   @default("NOUVEAU")
  createdAt   DateTime @default(now())
}

model EditToken {
  id         String    @id @default(cuid())
  token      String    @unique @default(cuid())
  artisanId  String
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime  @default(now())
  artisan    Artisan   @relation(fields: [artisanId], references: [id], onDelete: Cascade)
}

model OAuthAccount {
  id                String  @id @default(cuid())
  artisanId         String
  provider          String  // "google"
  providerAccountId String
  access_token      String? @db.Text
  refresh_token     String? @db.Text
  expires_at        Int?
  artisan           Artisan @relation(fields: [artisanId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Avis {
  id           String   @id @default(cuid())
  artisanId    String
  auteurPrenom String
  auteurEmail  String
  note         Int      // 1-5
  commentaire  String   @db.VarChar(800)
  status       String   @default("EN_ATTENTE")
  createdAt    DateTime @default(now())
  artisan      Artisan  @relation(fields: [artisanId], references: [id], onDelete: Cascade)
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

## API Routes principales

| Méthode  | Route                       | Description                                           |
| -------- | --------------------------- | ----------------------------------------------------- |
| POST     | `/api/inscription`          | Inscription artisan public                            |
| POST     | `/api/contact`              | Formulaire de contact fiche artisan                   |
| POST     | `/api/besoins`              | Dépôt de besoin particulier (auth)                    |
| POST     | `/api/upload`               | Upload photos chantier (besoin, contact)              |
| POST     | `/api/upload/logo`          | Upload logo artisan → stockage DB → `/api/files/{id}` |
| POST     | `/api/upload/portfolio`     | Upload photos portfolio artisan → stockage DB         |
| GET      | `/api/files/[id]`           | Servir un fichier uploadé depuis la DB                |
| GET/PUT  | `/api/mon-espace/profile`   | Lecture/mise à jour profil artisan connecté           |
| DELETE   | `/api/mon-espace/account`   | Suppression de compte (RGPD, soft delete)             |
| GET/POST | `/api/mon-espace/portfolio` | Gestion photos portfolio artisan                      |
| GET/POST | `/api/admin/*`              | Back-office admin (protégé)                           |
| GET/POST | `/api/messagerie/*`         | Messagerie artisan ↔ particulier                      |
| POST     | `/api/auth/check-email`     | Vérifie si un email existe (flow connexion)           |
| POST     | `/api/auth/register`        | Crée un compte artisan avec mot de passe              |

### Stockage fichiers (uploads)

**PostgreSQL — table `UploadedFile`**

- Les fichiers (logos, photos portfolio, photos chantier) sont stockés en binaire dans la DB
- Servis via la route `/api/files/[id]` avec headers `Content-Type` et cache
- Pas de stockage sur le filesystem (évite la perte au redéploiement Docker)
- Compression automatique via `sharp` (JPEG/WebP, qualité 80, max 1200px)
- Types acceptés : JPEG, PNG, WebP, SVG (logo uniquement)
- Taille max avant compression : 5 Mo
- Contextes : `logo` | `portfolio` | `besoin` | `contact`

---

## Variables d'environnement requises

```env
# Base de données
DATABASE_URL=

# Auth
AUTH_SECRET=
NEXTAUTH_URL=

# OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
```

---

## Performance & SEO

- **Pages artisans** (`/artisans`) : `force-dynamic` — SSR à chaque requête (fond role-aware)
- **Landings SEO** (`/artisans/[metier]/[commune]`) : `force-dynamic` — nécessaire pour fond role-aware
- **Fiche artisan** (`/artisan/[id]`) : `force-dynamic` — session requise pour bandeau prévisualisation
- **Sitemap** (`/sitemap.xml`) : généré dynamiquement depuis la DB
- **Métadonnées OpenGraph** : sur chaque fiche artisan et page landing
- Core Web Vitals : LCP < 2.5s, CLS < 0.1 (objectif)
