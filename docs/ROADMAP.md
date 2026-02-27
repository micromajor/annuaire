# Roadmap — OyezArtisans · Réseau local d'artisans

> Dernière mise à jour : 2026 — Phase de qualification (QA_PLAN.md créé, copilot-instructions enrichi)
> Statuts : `[ ]` à faire · `[~]` en cours · `[x]` terminé

---

## Vision produit

OyezArtisans n'est pas un simple annuaire : c'est un **réseau hyperlocal de confiance** ancré sur le territoire de Nantes Est.

### Ce qui nous différencie des acteurs existants

| Acteur                         | Problème                                | Notre réponse                           |
| ------------------------------ | --------------------------------------- | --------------------------------------- |
| Pages Jaunes, Mister Menuisier | Froid, national, non qualifié           | Validation humaine, ancrage local       |
| Habitissimo, Houzz             | Spam, logique de leads, pas de relation | Mise en relation directe, humanisée     |
| Groupes Facebook               | Informel, non structuré, introuvable    | Structuré, pérenne, fiable              |
| Bouche-à-oreille               | Ne passe pas à l'échelle                | Numérisé sans perdre la chaleur humaine |

### Progression de valeur (sans brûler les étapes)

```
V1 — Annuaire + mise en relation directe        ← on est là
V2 — Avis clients vérifiés + profil enrichi
V3 — Réseau artisan ↔ artisan (renvois, sous-traitance)
V4 — Communauté locale (clients, assos, territorio)
```

> ⚠️ Outil pro (devis, facturation) = autre marché, hors scope.

---

## Phase 0 — Fondations & cadrage _(terminé)_

- [x] Définition du contexte projet et périmètre V1
- [x] Rédaction du copilot-instructions (Jarvis dev)
- [x] Création de la structure documentaire (Roadmap, Référentiels)
- [x] Choix définitif de la stack technique (Next.js 16 / PostgreSQL 18 / Prisma 7)
- [x] Initialisation du projet (Next.js + Tailwind + Prisma)
- [x] Schéma Prisma modélisé + migration initiale appliquée
- [x] Variables d'environnement configurées (.env + .env.example)
- [x] Validators Zod (contact + inscription artisan)
- [x] Constantes métier (métiers, communes Nantes Est, types de travaux)
- [x] Client Prisma singleton (src/lib/db/client.ts)
- [x] Vitest + Testing Library configurés
- [x] Prettier + Husky + lint-staged mis en place
- [x] Renommage middleware.ts → proxy.ts (Next.js 16 deprecation)
- [ ] Mise en place CI/CD (GitHub Actions : lint + tests + build)

---

## Phase 1 — MVP Annuaire _(en cours)_

### Données & modèle

- [x] Modélisation DB : Artisan, Métier, Commune, Contact
- [x] Mise en place Prisma + migrations initiales
- [x] Seed de données : 6 artisans zone Nantes Est + 13 métiers + 20 communes (ajout terrassier + paysagiste + ramoneur 24/02/2026)
- [x] **Métiers entièrement DB-driven** (24/02/2026) : constante `METIERS` supprimée — tous les formulaires, filtres, sitemap et pages ISR récupèrent les métiers via `prisma.metier.findMany()`

### Front — Consultation

- [x] Design system BD (couleurs, typo, composants : card, btn, badge, input, select)
- [x] Header + Footer
- [x] Page d'accueil : HeroSearch inline (recherche + split panel Google-style + responsive mobile)
- [x] Page liste artisans `/artisans` (filtres métier + commune, pagination, SSR/SEO) — accès via "Voir tous les résultats" uniquement
- [x] Harmonisation page `/artisans` : fond jaune, header inline, FloatingTools, badge — cohérent avec home
- [x] Filtres multi-métiers : MultiCombobox (multi-select badges), commune par zone, layout flex-2/flex-1
- [x] Page fiche artisan (détail complet + sidebar coordonnées)
- [x] Restyling fiche artisan : fond jaune, header/footer inline, note moyenne, sidebar sticky
- [x] Page 404 custom thème BD
- [x] Responsive mobile-first (barre de recherche verticale, liste/panel plein écran, bouton retour)
- [x] Animation split panel desktop 38/62% + slideUpFade résultats

### Mise en relation V1

- [x] Formulaire de contact sur la fiche artisan (React Hook Form + Zod)
- [x] API route POST /api/contact (validation, rate limiting, sauvegarde DB)
- [x] Envoi email Resend (conditionnel selon clé API configurée)
- [ ] Page de confirmation standalone (optionnel)

### Inscription artisan

- [x] Formulaire d'inscription artisan (public) — `/inscription`
- [x] API route POST /api/inscription (validation, rate limiting, DB save, emails)
- [x] Workflow de validation manuelle (back-office admin)
- [x] Interface admin `/admin` (liste EN_ATTENTE, valider/rejeter, stats)
- [x] Authentification admin (NextAuth v5, Credentials, protection middleware)

---

## Phase 2 — Inscription artisans _(en cours)_

- [x] Formulaire d'inscription artisan (public) — `/inscription`
- [x] API route POST /api/inscription
- [x] Workflow de validation manuelle — back-office `/admin`
- [x] Interface admin : liste EN_ATTENTE, valider/rejeter, stats
- [x] Authentification admin (NextAuth v5, Credentials, middleware)
- [x] **Réorganisation admin en tableau de bord** (24/02/2026) : sidebar sticky avec KPIs et nav par ancres, sections structurées (fiches / modifs / avis / besoins / feedbacks / utilisateurs), états vides explicites
- [x] **Métier libre** (24/02/2026) : champ `metierLibre` sur l'artisan — option "Autre…" dans les formulaires inscription + mon-espace + mon-profil, badge "Métier suggéré" en admin, bouton "Créer & assigner" pour officialiser le nouveau métier en DB
- [x] **Gestion admin des métiers** : section dédiée dans le tableau de bord admin — liste avec compteur d'artisans, renommage inline, ajout d'un nouveau métier (slug auto-généré), suppression si aucun artisan associé (APIs REST + client component)
- [x] Logo artisan par URL (affiché sur la carte et la fiche)
- [x] Magic link — `/mon-profil` : demande par email + édition sécurisée via token
- [x] Migration DB : `logoUrl` + `EditToken` (token expirant, usage unique)
- [x] Rôles NextAuth multi-profils : `admin` / `artisan` / `particulier`
- [x] Homepage différenciée par rôle (3 vues : visiteur / artisan / particulier)
- [x] Vue artisan home : "Vous pourriez les intéresser" — matching des Besoins par métier + commune + split panel
- [x] Vue particulier home : toggle Trouver/Mon projet + formulaire dépôt de besoin
- [x] Upload photos chantier (max 6 × 5 Mo, stockage `/public/uploads/besoins/`)
- [x] Modèle Prisma `Besoin` : `photos Json?`, `artisanId String?`, `contact String?`, `status`
- [x] Migration DB : `besoin_photos_contact_optional`
- [x] API POST `/api/besoins` (Zod, session auth, persist prénom artisan)
- [x] API POST `/api/upload` (multipart, UUID filenames, validation type + taille)
- [x] Lightbox photo dans le panneau artisan (overlay `z-[200]`, fermeture fond ou ✕)
- [x] Toggle Liste/Carte artisan (style BD identique ParticulierHome : border-3, actif #1a1a2e/vert)
- [x] Carte artisan responsive mobile (flex-col sm:flex-row, panneau mobile séparé sous carte)
- [x] Page "Mon espace" particulier : liste besoins, header bleu, signOut (fix middleware proxy.ts)

---

## Phase 3 — Avis & confiance _(en cours)_

- [x] Système d'avis clients (formulaire sur fiche, modération admin, affichage avec note/moyenne)
- [x] Avis anti-fraude : token UUID unique généré au contact, lien dans email confirmation, validation token côté API, transaction atomique (créer avis + marquer token utilisé)
- [ ] Badge "Coup de cœur" artisan (sélection éditoriale)

---

## Décisions / suppressions

- [x] **Suppression puis réimplémentation feature Besoin** : supprimée le 18/02/2026 (YAGNI, pas de backend), puis réimplémentée le même jour sous forme de feature complète avec modèle DB, API, upload photos et vue artisan matching.
- [x] **Simplification header** (18/02/2026) : liens "Trouver un artisan" et "Déposer un besoin" retirés du header. L'accueil est le point d'entrée unique pour les visiteurs.
- [x] **`prisma generate` obligatoire après migration** : le client Prisma doit être régénéré après toute migration pour que les nouveaux champs soient disponibles en runtime (appris via bug `photos` + `artisanId` inconnus).
- [x] **Fix middleware proxy.ts** (19/02/2026) : `role !== "artisan"` → `!["artisan","particulier"].includes(role)` sur `/mon-espace`. Cause : le middleware bloquait les particuliers silencieusement avant même l'exécution du Server Component.
- [x] **Fix upsert ArtisanMetier (PrismaPg + composite key)** (24/02/2026) : `upsert` sur table de jonction `@@id` composite échoue silencieusement avec l'adapter PrismaPg. Pattern correct : `findFirst` + `create` conditionnel. Applicable aussi à `ArtisanCommune`.
- [x] **Suppression page /inscription morte** (24/02/2026) : redirige vers `/connexion?callbackUrl=/mon-espace` — l'inscription passe désormais uniquement par le flux artisan sécurisé.
- [x] **Conflit routing Next.js** (20/02/2026) : `artisans/[id]/page.tsx` et `artisans/[metier]/[commune]/page.tsx` ne peuvent pas coexister — deux noms de segments différents au même niveau. Suppression de `artisans/[id]` (doublon — la fiche canonique est `/artisan/[id]` au singulier).
- [x] **Validateur Zod `logoUrl`** (20/02/2026) : `z.string().url()` rejetait les chemins relatifs `/api/files/...` retournés par l'upload interne. Remplacé par `.refine()` acceptant URLs absolues ET chemins `/api/files/`.
- [x] **`generateStaticParams` retourne `[]`** (20/02/2026) : évite l'accès DB au build Docker (ECONNREFUSED). L'ISR prend le relais à la première visite.
- [x] **Fond de page role-aware** (20/02/2026) : toutes les pages publiques adoptent la couleur du rôle connecté (vert artisan, bleu particulier, jaune visiteur). Les landings SEO passées en `force-dynamic` pour le supporter.
- [x] **Admin home** (20/02/2026) : le rôle `admin` n'était pas géré sur la home → tombait en vue "visiteur" (fond jaune + "Se connecter"). Fix : branche dédiée avec lien Administration + déconnexion.
- [x] **SiretVerifBadge React Strict Mode** (24/02/2026) : le `cancelled` flag bloquait la 2ème invocation de l'effet en dev Strict Mode (cleanup run1 → cancelled=true → run2 ignore la réponse). Fix : suppression du flag, les deux fetches se terminent avec les mêmes données (idempotent). En production (pas de Strict Mode) → 1 seul fetch.
- [x] **Header mon-espace artisan** (24/02/2026) : header opaque avec nom artisan et bouton "Déconnexion" remplacé par header transparent "Oyez Artisans !" + icône messages + icône logout — cohérent avec `artisan/[id]/page.tsx`.
- [x] **SiretVerifBadge dans MonEspaceEditForm** (24/02/2026) : le badge était uniquement dans `EditProfilForm` (`/mon-profil/[token]`). Ajouté à `MonEspaceEditForm` (`/mon-espace`).
- [x] **whitespace-pre-wrap description mon-espace** (24/02/2026) : la description restituée sur `/mon-espace` n'avait pas `whitespace-pre-wrap` — les retours à la ligne du textarea étaient ignorés.
- [x] **Carte OG redesign BD** (25/02/2026) : refonte complète de l'image `/api/artisan/[id]/carte` — fond jaune `#ffd93d`, halftone dots, branding "OYEZ ARTISANS ! 44", nom géant Bangers, badges métiers, logo si présent. Utilisée pour les partages Facebook/WhatsApp.
- [x] **Satori : logo WebP + fonts:[]** (25/02/2026) : deux causes superposées provoquant `u2 is not iterable` dans satori (next/og). (1) Logo stocké en WebP → satori ne supporte que PNG/JPEG — fix : filtrer `mimeType` avant de passer `src` à `<img>`. (2) `fonts: []` → satori refuse de rendre ("No fonts are loaded") — fix : toujours fournir au moins une police (Bangers). Retenirs : utiliser `{cond ? (...) : null}` (pas `&&`), éviter `inset`/`overflow`/`boxSizing`, forcer `await image.arrayBuffer()` pour attraper les erreurs lazy.
- [x] **Champ accroche artisan** (25/02/2026) : phrase d'accroche courte (200 chars max) affichée sous le nom sur la carte OG ET sur les cards artisan dans le listing. Éditable via `/mon-espace` et `/mon-profil/[token]`. Inclus dans le système de draft pour les artisans VALIDE. Migration `20260225002200_add_accroche_to_artisan`.
- [x] **Suppression mécanisme draft/validation** (26/02/2026) : mécanisme `hasPendingDraft` / `draftData` supprimé — trop lourd pour l'UX. Les modifications artisan (VALIDE ou non) s'appliquent désormais directement en DB. Bandeau "en attente" et section "Modifications" admin supprimés.
- [x] **Système signalement** (26/02/2026) : nouveau modèle `Signalement` (migration `20260226200000_add_signalement`). Bouton "Signaler cette fiche" discret dans le footer de chaque fiche artisan → `SignalementModal` (motif requis + email optionnel). Section dédiée dans l'admin avec bouton "Marquer lu" (`PATCH /api/admin/signalements/[id]`).
- [x] Logo sans rognage + restructuration ArtisanCard (commit 7764cd9)
- [x] z-index MetierCombobox vs Leaflet (commit eb27285)
- [~] Portfolio chantiers sur la fiche artisan (photos + description) ← prochain
- [x] SEO : sitemap.xml, meta dynamiques, pages par commune (commit 9ca7208)
- [x] RGPD : mentions légales, politique confidentialité, suppression de compte (commit eec52d5)
- [x] **Phase de qualification** : création `docs/QA_PLAN.md` (113 cas de test FO+BO, P0/P1/P2), enrichissement copilot-instructions avec procédure QA, retrait artisans fictifs prod, nettoyage repo

---

## Phase 4 — Réseau artisan ↔ artisan _(à faire)_

> Objectif : transformer les artisans d'inscrits isolés en un réseau actif.

- [ ] Système de "Je connais quelqu'un" (renvois inter-artisans)
- [ ] Sous-traitance : un artisan peut recommander un confrère sur une tâche hors compétence
- [ ] Profil "réseau" : afficher les artisans recommandés par un artisan donné
- [ ] Messagerie interne artisan ↔ artisan (simple)
- [ ] Annuaire interne visible uniquement des artisans inscrits

---

## Phase 5 — Communauté locale _(à faire)_

> Objectif : ancrer OyezArtisans comme acteur du tissu local, pas juste un outil.

- [ ] Feed local (actualités chantiers, projets du quartier)
- [ ] Partenariats assos / mairies / syndics
- [ ] Carte interactive des artisans (Leaflet)
- [ ] Extension géographique : 44 complet → Pays de la Loire

---

## Phase 6 — Modèle économique _(à définir)_

> Pas de pression : objectif impact local d'abord. Revenus complémentaires bienvenus.

- [ ] Définition du modèle (proposition : freemium artisan — fiche basique gratuite, profil enrichi payant)
- [ ] Profil enrichi : photos, priorité dans les résultats, badge premium
- [ ] Intégration paiement (Stripe)
- [ ] Tableau de bord artisan (stats de vues, contacts reçus)

---

## Backlog / idées

- Application mobile (PWA d'abord)
- Notifications push (nouveau chantier dans ma zone)
- API publique pour partenaires locaux
- Extension métiers (second œuvre, services à domicile)
