# Plan de Qualification — Oyez Artisans

> Document vivant. Mis à jour à chaque release ou découverte de comportement inattendu.  
> Dernière mise à jour : 27 février 2026 — Exécution des tests MCP : 55+ cas validés (session 2)

---

## Légende

| Symbole | Signification                          |
| ------- | -------------------------------------- |
| P0      | Critique — bloquant en prod            |
| P1      | Important — dégradation notable        |
| P2      | Mineur — confort ou esthétique         |
| ✅      | Testé et OK                            |
| ❌      | Bug identifié                          |
| ⚠️      | Partiellement OK / comportement ambigu |
| 🔲      | Non encore testé                       |

---

## 1. Authentification & Identité

### 1.1 Connexion email/mot de passe

- **Route** : NextAuth `/api/auth/[...nextauth]` + `POST /api/auth/register`
- **Page** : `/connexion`
- **Criticité** : P0
- **Acteurs** : artisan, particulier

| #   | Cas de test                                      | Attendu                                              | Statut |
| --- | ------------------------------------------------ | ---------------------------------------------------- | ------ |
| A01 | Connexion avec email + mot de passe valides      | Redirection vers `/mon-espace` ou `/` selon le rôle  | ✅     |
| A02 | Connexion avec mot de passe incorrect            | Message d'erreur, pas de redirection                 | ✅     |
| A03 | Connexion avec email inexistant                  | Message d'erreur générique (sans révéler l'absence)  | ⚠️     |
| A04 | Rate limit : 5 tentatives/h dépassées            | HTTP 429 + message clair                             | 🔲     |
| A05 | Mot de passe oublié : envoi email reset          | Confirmation "email envoyé" sans révéler l'existence | ✅     |
| A06 | Inscription avec email déjà pris (avec password) | HTTP 409, message "compte existe déjà"               | 🔲     |
| A07 | Inscription avec email déjà pris (sans password) | Password ajouté silencieusement, succès              | 🔲     |

**Risques** : Rate limit in-memory perdu au redémarrage du pod. Pas de lockout permanent.

---

### 1.2 Connexion Google OAuth

- **Route** : NextAuth Google provider
- **Criticité** : P1
- **Acteurs** : artisan, particulier

| #   | Cas de test                                    | Attendu                                  | Statut |
| --- | ---------------------------------------------- | ---------------------------------------- | ------ |
| B01 | Clic "Connexion Google" → flow OAuth complet   | Redirection vers page d'accueil connecté | 🔲     |
| B02 | Compte Google déjà lié → re-connexion          | Session restaurée                        | 🔲     |
| B03 | Email Google coïncide avec un artisan existant | Compte lié, accès artisan                | 🔲     |

---

### 1.3 Mot de passe oublié

- **Route** : `POST /api/auth/forgot-password` + `POST /api/auth/reset-password`
- **Page** : `/connexion` (modal) + `/connexion/reset/[token]`
- **Criticité** : P1

| #   | Cas de test                          | Attendu                                                 | Statut |
| --- | ------------------------------------ | ------------------------------------------------------- | ------ |
| C01 | Demande de reset pour email existant | Email envoyé, réponse "succès" sans révéler l'existence | ✅     |
| C02 | Demande pour email inexistant        | Même réponse "succès" (pas de fuite d'info)             | ✅     |
| C03 | Utiliser le token de reset valide    | Mot de passe changé, token invalidé                     | ✅     |
| C04 | Token expiré (> 1h)                  | Erreur "lien expiré", redirection vers nouvelle demande | ✅     |
| C05 | Token déjà utilisé                   | Erreur "lien déjà utilisé"                              | ✅     |

---

## 2. Front-Office — Pages publiques

### 2.1 Page d'accueil

- **Page** : `/`
- **Criticité** : P0
- **Composants** : `HeroSearch`, `ParticulierHome` (selon rôle)

| #   | Cas de test                             | Attendu                                            | Statut |
| --- | --------------------------------------- | -------------------------------------------------- | ------ |
| E01 | Visiteur non connecté                   | Hero avec moteur de recherche, fond jaune visiteur | ✅     |
| E02 | Artisan connecté                        | Vue artisan (fond vert #6bcb77)                    | ✅     |
| E03 | Particulier connecté                    | Vue particulier (fond bleu #60c5f1)                | 🔲     |
| E04 | Saisir un métier + commune et soumettre | Redirection vers `/artisans` avec filtres          | ✅     |
| E05 | Dropdown métiers groupés par catégorie  | Headers de catégorie affichés                      | ✅     |
| E06 | Open Graph image                        | `/opengraph-image` retourne une image valide       | 🔲     |

---

### 2.2 Listing artisans

- **Page** : `/artisans`
- **Criticité** : P0
- **Composants** : `FiltresArtisans`, `ArtisanCard`

| #   | Cas de test                                          | Attendu                                                | Statut |
| --- | ---------------------------------------------------- | ------------------------------------------------------ | ------ |
| F01 | Accès sans filtre                                    | Liste des artisans validés (status=VALIDE)             | ✅     |
| F02 | Filtre par métier                                    | Résultats filtrés correctement                         | 🔲     |
| F03 | Filtre par commune                                   | Résultats filtrés correctement                         | 🔲     |
| F04 | Filtre métier + commune combinés                     | Intersection correcte                                  | 🔲     |
| F05 | Dropdown métiers groupés                             | Categories affichées en uppercase gris                 | ✅     |
| F06 | Aucun résultat                                       | Message "aucun artisan trouvé" affiché                 | 🔲     |
| F07 | Artisan dont le status DB n'est pas `VALIDE`         | N'apparaît pas dans la liste (filtre Prisma)           | 🔲     |
| F08 | Artisan supprimé par l'admin (`deletedAt` renseigné) | N'apparaît pas (soft-delete, données conservées en DB) | ✅     |

---

### 2.3 Fiche artisan

- **Page** : `/artisan/[id]`
- **Criticité** : P0
- **Composants** : `ContactForm`, `AvisSection`, `PortfolioGallery`, `SignalementModal`

| #   | Cas de test                                         | Attendu                                             | Statut |
| --- | --------------------------------------------------- | --------------------------------------------------- | ------ |
| G01 | Accès fiche artisan (fiche en ligne)                | Page complète affichée                              | ✅     |
| G02 | Fiche d'un artisan supprimé (`deletedAt` renseigné) | 404                                                 | ✅     |
| G03 | Affichage logo artisan                              | Logo affiché depuis `/api/files/[id]`               | ✅     |
| G04 | Affichage photos portfolio                          | Galerie photos affichée, lightbox fonctionnelle     | 🔲     |
| G05 | Lightbox : scroll body verrouillé à l'ouverture     | `overflow: hidden` sur body                         | 🔲     |
| G06 | Lightbox : scroll restauré à la fermeture           | `overflow: auto` ou `""` sur body                   | 🔲     |
| G07 | Contact form : soumission valide                    | ContactRequest créé, email envoyé, avisToken généré | ✅     |
| G08 | Contact form : champs obligatoires manquants        | Erreurs de validation affichées                     | 🔲     |
| G09 | Contact form : rate limit (3/h)                     | Message "trop de demandes"                          | 🔲     |
| G10 | Avis : accès avec avisToken valide                  | Section avis affichée, formulaire actif             | ✅     |
| G11 | Avis : soumission avis                              | Avis créé EN_ATTENTE, token marqué usedAt           | ✅     |
| G12 | Avis : sans token / token invalide                  | Section avis grisée "🔒 LIEN REQUIS"                | ✅     |
| G13 | Avis validés : affichage public                     | Seuls les avis status=VALIDE affichés               | ✅     |
| G14 | Signalement fiche                                   | Signalement créé, confirmation affichée             | ✅     |

**Risques** : Si `RESEND_API_KEY` non configurée, les emails ne partent pas silencieusement.

---

### 2.4 Page SEO artisans par métier/commune

- **Page** : `/artisans/[metier]/[commune]`
- **Criticité** : P1
- **Cas d'usage** : pages générées dynamiquement pour chaque combinaison métier×commune. Indexées par Google pour capter les recherches locales (ex : "plombier à Rezé"). Chaque métier en DB × chaque commune de la constante `COMMUNES_NANTES_EST` génère une URL valide. Le sitemap liste toutes ces combinaisons pour le crawl. C'est une page `force-dynamic` pour adapter le fond selon le rôle connecté.

| #   | Cas de test                              | Attendu                                                      | Statut |
| --- | ---------------------------------------- | ------------------------------------------------------------ | ------ |
| H01 | URL valide métier + commune              | Page affichée avec artisans (status=VALIDE)                  | ✅     |
| H02 | Métier inexistant en DB                  | 404                                                          | ✅     |
| H03 | Commune hors liste `COMMUNES_NANTES_EST` | 404                                                          | 🔲     |
| H04 | Aucun artisan pour ce métier/commune     | Message "pas encore de X sur Y" + liens vers autres communes | 🔲     |
| H05 | Titre page et meta description           | Contiennent le métier et la commune (SEO)                    | ✅     |
| H06 | JSON-LD BreadcrumbList + ItemList        | Présent dans le DOM                                          | 🔲     |
| H07 | Liens vers autres communes (même métier) | Section "X dans d'autres communes" affichée                  | ✅     |

---

## 3. Front-Office — Formulaires publics

### 3.1 Inscription artisan

- **Page** : `/inscription`
- **Route** : `POST /api/inscription`
- **Criticité** : P0

| #   | Cas de test                                        | Attendu                                                        | Statut |
| --- | -------------------------------------------------- | -------------------------------------------------------------- | ------ |
| I01 | Formulaire complet valide                          | Artisan créé, emails de confirmation envoyés (admin + artisan) | 🔲     |
| I02 | Email déjà utilisé                                 | HTTP 409                                                       | 🔲     |
| I03 | SIRET invalide (format)                            | Erreur validation Zod côté client                              | 🔲     |
| I04 | Vérification SIRET via API gouv                    | Résultat affiché (nom officiel, commune, NAF)                  | 🔲     |
| I05 | SIRET introuvable dans API gouv                    | Message "SIRET non trouvé" affiché                             | 🔲     |
| I06 | Rate limit (3/h)                                   | HTTP 429                                                       | 🔲     |
| I07 | Inscription sans mot de passe (formulaire initial) | Compte créé sans passwordHash                                  | 🔲     |

---

### 3.2 Dépôt de besoin

- **Route** : `POST /api/besoins`
- **Composant** : `BesoinForm` (dans homepage particulier)
- **Criticité** : P1

| #   | Cas de test                                   | Attendu                              | Statut |
| --- | --------------------------------------------- | ------------------------------------ | ------ |
| J01 | Soumission besoin sans être connecté          | HTTP 401 — connexion requise         | ✅     |
| J02 | Soumission besoin par un particulier connecté | Besoin créé, artisanId lié           | 🔲     |
| J03 | Photos jointes (max 6)                        | URLs sauvegardées dans `photos` JSON | 🔲     |
| J04 | Description < 10 caractères                   | Erreur validation                    | 🔲     |

---

### 3.3 Feedback général

- **Route** : `POST /api/feedback`
- **Composant** : `FeedbackWidget` (bouton flottant)
- **Criticité** : P2

| #   | Cas de test                     | Attendu               | Statut |
| --- | ------------------------------- | --------------------- | ------ |
| K01 | Feedback type + message valides | Feedback créé en base | 🔲     |
| K02 | Message vide                    | Erreur validation     | 🔲     |

---

## 4. Front-Office — Espace Artisan (authentifié)

### 4.1 Mon Espace — Dashboard artisan

- **Page** : `/mon-espace`
- **Route** : `GET|PATCH /api/mon-espace/profile`, `PATCH /api/mon-espace/account`
- **Criticité** : P0

| #   | Cas de test                           | Attendu                                    | Statut |
| --- | ------------------------------------- | ------------------------------------------ | ------ |
| L01 | Accès non authentifié                 | Redirection vers `/connexion`              | ✅     |
| L02 | Accès artisan connecté                | Dashboard avec fiche, stats, messages      | ✅     |
| L04 | Modifier prenom, nom, téléphone       | Changements sauvegardés                    | ✅     |
| L05 | Modifier description (max 2000 chars) | Sauvegardé, compteur caractères            | ✅     |
| L06 | Modifier accroche (max 200 chars)     | Sauvegardé                                 | ✅     |
| L07 | Changer email                         | Mise à jour sans conflit                   | 🔲     |
| L08 | Changer mot de passe                  | Hash mis à jour, ancienne session valide   | 🔲     |
| L09 | Dernières demandes reçues affichées   | ContactRequests visibles dans le dashboard | ✅     |
| L10 | Ajouter/supprimer communes            | Relations ArtisanCommune mises à jour      | 🔲     |

---

### 4.2 Upload logo

- **Route** : `POST /api/upload/logo`
- **Criticité** : P1

| #   | Cas de test                 | Attendu                                                                | Statut |
| --- | --------------------------- | ---------------------------------------------------------------------- | ------ |
| M01 | Upload PNG/JPEG valide      | UploadedFile créé, `logoUrl` artisan mis à jour avec `/api/files/[id]` | 🔲     |
| M02 | Upload fichier trop lourd   | Erreur 413 ou message "fichier trop grand"                             | 🔲     |
| M03 | Upload format non image     | Erreur validation                                                      | 🔲     |
| M04 | Affichage logo sur la fiche | Image chargée depuis `/api/files/[id]`                                 | 🔲     |

**⚠️ Rappel** : La route retourne une URL relative `/api/files/[id]`, pas une URL absolue. Les validateurs Zod avec `z.string().url()` doivent utiliser `.refine()`.

---

### 4.3 Portfolio photos

- **Route** : `POST|DELETE /api/portfolio`
- **Route upload** : `POST /api/upload`
- **Criticité** : P1

| #   | Cas de test                            | Attendu                                | Statut |
| --- | -------------------------------------- | -------------------------------------- | ------ |
| N01 | Upload photo portfolio                 | Photo ajoutée à `portfolioPhotos` JSON | 🔲     |
| N02 | Suppression photo portfolio            | Retirée de `portfolioPhotos`           | 🔲     |
| N03 | Galerie affichée sur la fiche publique | Photos visibles                        | 🔲     |
| N04 | Lightbox fonctionnelle                 | Navigation prev/next, fermeture ESC    | 🔲     |

---

## 5. Front-Office — Messagerie (authentifié)

- **Routes** : `GET|POST /api/conversations`, `GET|POST /api/conversations/[id]/messages`, `GET /api/messages/unread-count`
- **Pages** : `/messages`, `/messages/[id]`
- **Criticité** : P1

| #   | Cas de test                                  | Attendu                                                        | Statut |
| --- | -------------------------------------------- | -------------------------------------------------------------- | ------ |
| O01 | Accès non authentifié                        | Redirection `/connexion`                                       | ✅     |
| O02 | Créer une conversation particulier → artisan | Conversation créée (unique par paire)                          | 🔲     |
| O03 | Envoyer un message                           | Message créé `lu=false`                                        | 🔲     |
| O04 | Artisan répond                               | Message avec `expediteur="artisan"`                            | 🔲     |
| O05 | Badge messages non lus                       | `unread-count` reflète les non lus                             | 🔲     |
| O06 | Marquer messages comme lus                   | `lu` passé à `true` pour les messages de l'interlocuteur       | 🔲     |
| O07 | Conversation dupliquée (même paire)          | Unique constraint respectée, conversation existante réutilisée | 🔲     |

---

## 6. Back-Office Admin

### 6.1 Dashboard admin

- **Page** : `/admin`
- **Criticité** : P0

| #   | Cas de test                      | Attendu                                                       | Statut |
| --- | -------------------------------- | ------------------------------------------------------------- | ------ |
| P01 | Accès non admin                  | Redirection vers `/admin/login`                               | ✅     |
| P02 | Accès admin authentifié          | KPIs, liste artisans, demandes de contact, signalements, avis | ✅     |
| P03 | KPIs : total artisans validés    | Chiffre correct (11 validés, 0 rejetés)                       | ✅     |
| P04 | Navigation par ancres (sections) | Scroll vers la bonne section                                  | ✅     |

---

### 6.2 Gestion des artisans (admin)

- **Route** : `DELETE /api/admin/artisans/[id]`
- **Note** : Il n'y a plus de système de validation manuelle par l'admin. Le passage EN_ATTENTE → VALIDE sera géré par validation email (à implémenter). L'admin ne peut que supprimer les artisans (soft delete).
- **Criticité** : P1

| #   | Cas de test                               | Attendu                                                                | Statut |
| --- | ----------------------------------------- | ---------------------------------------------------------------------- | ------ |
| Q01 | Supprimer artisan (soft delete) via admin | `deletedAt` renseigné, fiche disparaît du FO, label "Supprimé" affiché | ✅     |
| Q02 | Artisan supprimé non visible en FO        | La fiche artisan renvoie 404                                           | ✅     |
| Q03 | Action DELETE sans token admin            | HTTP 401                                                               | ✅     |

---

### 6.3 Gestion des métiers (admin)

- **Route** : `GET|POST /api/admin/metiers`, `PATCH|DELETE /api/admin/metiers/[id]`
- **Criticité** : P1

| #   | Cas de test                                  | Attendu                                           | Statut |
| --- | -------------------------------------------- | ------------------------------------------------- | ------ |
| R01 | Lister tous les métiers                      | Liste avec count artisans par catégorie           | ✅     |
| R02 | Créer un métier                              | Slug auto-généré (NFD + kebab-case), créé en base | ✅     |
| R03 | Créer métier avec label dupliqué (même slug) | HTTP 409, message erreur affiché                  | ✅     |
| R04 | Modifier label/catégorie d'un métier         | Mise à jour, slug inchangé                        | ✅     |
| R05 | Supprimer métier sans artisans               | Confirmation dialog, suppression OK               | ✅     |
| R06 | Supprimer métier avec artisans liés          | Bouton désactivé (disabled), action impossible    | ✅     |

---

### 6.4 Modération des avis

- **Route** : `PATCH /api/admin/avis/[id]`
- **Criticité** : P1

| #   | Cas de test                | Attendu                                 | Statut |
| --- | -------------------------- | --------------------------------------- | ------ |
| S01 | Valider un avis EN_ATTENTE | Status → VALIDE, avis visible sur fiche | ✅     |
| S02 | Rejeter un avis            | Status → REJETE, avis masqué            | 🔲     |

---

### 6.5 Gestion des signalements

- **Route** : `PATCH /api/admin/signalements/[id]`
- **Criticité** : P1

| #   | Cas de test                           | Attendu                                               | Statut |
| --- | ------------------------------------- | ----------------------------------------------------- | ------ |
| T01 | Traiter un signalement (✓ Marquer lu) | Signalement marqué lu, disparaît de la liste/compteur | ✅     |

---

## 7. Upload et Fichiers

### 7.1 Serve des fichiers

- **Route** : `GET /api/files/[id]`
- **Criticité** : P0

| #   | Cas de test                        | Attendu                          | Statut |
| --- | ---------------------------------- | -------------------------------- | ------ |
| V01 | Accéder à un fichier existant      | Binary avec Content-Type correct | 🔲     |
| V02 | Accéder à un fichier inexistant    | HTTP 404                         | 🔲     |
| V03 | Logos affichés sur fiches artisans | Images chargées correctement     | ✅     |
| V04 | Photos portfolio affichées         | Images chargées correctement     | 🔲     |

---

## 8. SEO & Performance

| #   | Cas de test                        | Attendu                                 | Statut |
| --- | ---------------------------------- | --------------------------------------- | ------ |
| W01 | `sitemap.ts` retourne URLs valides | XML sitemap accessible à `/sitemap.xml` | ✅     |
| W02 | `robots.ts` correctement configuré | `/robots.txt` accessible                | ✅     |
| W03 | `manifest.ts`                      | `/manifest.webmanifest` accessible      | ✅     |
| W04 | `apple-icon.tsx` + `icon.tsx`      | Favicons générés                        | 🔲     |
| W05 | Open Graph homepage                | Image générée, dimensions correctes     | 🔲     |

---

## 9. Sécurité — Checklist transversale

| #   | Vérification                                                               | Statut |
| --- | -------------------------------------------------------------------------- | ------ |
| X01 | Routes `/api/admin/*` rejettent les non-admins (401)                       | ✅     |
| X02 | Pages protégées `/mon-espace` redirigent vers `/connexion` si non connecté | ✅     |
| X03 | Un artisan ne peut pas modifier la fiche d'un autre                        | ✅     |
| X04 | Rate limiting actif sur les routes sensibles (auth, contact, inscription)  | 🔲     |
| X05 | Tokens (reset password, avis après contact) à usage unique                 | 🔲     |
| X06 | Soft delete : artisans supprimés absents du FO                             | ✅     |
| X07 | `/api/besoins` POST requiert authentification (401 sans session)           | ✅     |
| X08 | SIRET non obligatoire mais validé si fourni (format 14 chiffres)           | 🔲     |
| X09 | Filtre commune listing case-sensitive (`Vertou` ≠ `vertou` en DB)          | ⚠️     |

---

## 10. Régressions inter-composants

| #   | Scénario                                                            | Attendu                    | Statut |
| --- | ------------------------------------------------------------------- | -------------------------- | ------ |
| Y01 | Inscription artisan → connexion → fiche visible en FO               | Workflow complet           | 🔲     |
| Y02 | Contact FO → email artisan → avis via token                         | Workflow contact → avis    | ✅     |
| Y03 | Artisan modifie sa fiche → visible immédiatement sur fiche publique | Pas de cache bloquant      | ✅     |
| Y04 | Particulier dépose un besoin → visible dans admin                   | Besoin NOUVEAU listé       | 🔲     |
| Y05 | Fond de page adapté au rôle sur toutes les pages SSR                | Vert/bleu/jaune selon rôle | ⚠️     |

---

## 11. Périmètre hors-scope (explicitement non testé)

- Tests de charge / stress test (hors MVP)
- Accessibilité WCAG systématique (à planifier post-V1)
- Tests E2E automatisés Playwright (à planifier)
- Compatibilité navigateur IE/Edge Legacy

---

## 12. Procédure d'exécution des tests manuels

### Pré-requis

```bash
# 1. Dev server local
npm run dev  # port 3001

# 2. DB locale
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/annuaire_artisans

# 3. Comptes de test nécessaires
# - Admin : créer via seed ou directement en DB
# - Artisan validé : créer via /inscription ou admin
# - Particulier : créer via /connexion (inscription rapide)
```

### Ordre recommandé

1. Sécurité (section 9) — blocages fondamentaux
2. Auth (section 1) — prérequis pour tout le reste
3. Inscription artisan + connexion + fiche visible FO (Y01) — workflow central
4. Pages publiques (sections 2, 3) — FO
5. Espace artisan (sections 4, 5) — FO authentifié
6. Admin (section 6) — BO
7. SEO (section 8)
8. Régressions (section 10)

### Convention de mise à jour

- Remplacer `🔲` par `✅`, `❌` ou `⚠️`
- En cas de `❌` : créer un ticket avec `[BUG]` dans le titre et liér au cas de test
- En cas de `⚠️` : documenter le comportement observé dans une note inline

---

## 13. Bugs connus et décisions

| ID  | Description                                    | Décision                                              | Date |
| --- | ---------------------------------------------- | ----------------------------------------------------- | ---- |
| —   | Rate limiting in-memory (non persistant)       | Acceptable pour MVP, to upgrade Redis si trafic élevé | 2026 |
| —   | `generateStaticParams` retourne `[]` pour ISR  | Voulu : évite accès DB au build                       | 2026 |
| —   | `artisans/[metier]/[commune]` en force-dynamic | Voulu : personnalisation par rôle                     | 2026 |
