# Référentiel Fonctionnel — OyezArtisans

> Dernière mise à jour : 18 février 2026 — ajout acteur Particulier, F06 dépôt besoin, F07 matching artisan

---

## Vision produit

OyezArtisans est un **réseau hyperlocal de confiance** entre artisans du bâtiment et particuliers, ancré sur le territoire de Nantes Est.

Contrairement aux annuaires nationaux (froids, spammeurs) et aux groupes Facebook (informels, éphémères), OyezArtisans construit une relation durable entre le tissu artisanal local et ses habitants, avec une validation humaine et une identité visuelle chaleureuse.

**Zone V1 :** Nantes et Est de la Loire-Atlantique (44)  
**Métiers V1 :** Maçon, plombier, électricien, menuisier, peintre, couvreur, carreleur, chauffagiste, plaquiste, charpentier

---

## Acteurs

| Acteur             | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| **Visiteur**       | Particulier qui consulte l'annuaire sans compte                                  |
| **Particulier**    | Client inscrit (compte propre) qui peut déposer un besoin et suivre ses demandes |
| **Artisan**        | Professionnel inscrit (librement ou saisi par l'équipe)                          |
| **Administrateur** | Membre de l'équipe qui valide les fiches et modère                               |

---

## Fonctionnalités V1

### F01 — Consultation de l'annuaire

- Accès libre, sans inscription
- Recherche par **métier** (liste déroulante ou tag)
- Recherche par **commune** (texte libre ou liste)
- Combinaison des deux filtres
- Résultats paginés (20 par page)
- Tri par défaut : artisans vérifiés en premier, puis alphabétique

### F02 — Fiche artisan

Informations affichées :

- Nom / raison sociale
- Métier(s) exercé(s)
- Zone d'intervention (commune principale + rayons couverts)
- Téléphone (optionnel, masqué partiellement)
- Site web (optionnel, lien externe)
- Description courte (max 500 caractères)
- Badge "Vérifié" si validation manuelle effectuée
- Date d'ajout / dernière mise à jour

### F03 — Mise en relation (formulaire de contact)

- Accessible depuis la fiche artisan
- Champs : Prénom, Nom, Email, Téléphone (optionnel), Message (max 1000 car.), Type de travaux
- Validation côté client + serveur (Zod)
- Envoi d'un email à l'artisan avec les coordonnées du demandeur
- Email de confirmation automatique au client
- Protection antispan : honeypot + rate limiting (max 3 messages / heure / IP)
- Consentement RGPD explicite (checkbox obligatoire)

### F04 — Inscription artisan (libre)

- Formulaire public accessible depuis la page d'accueil et le footer
- Champs : Nom, Prénom, Raison sociale, SIRET, Métier(s), Commune principale, Zone d'intervention, Téléphone, Email, Site web, Description
- Validation SIRET (format + optionnellement API INPI)
- Statut initial : **en attente de validation**
- Email de confirmation à l'artisan avec accusé de réception
- Email de notification à l'admin

### F05 — Back-office Administration

- Accès protégé (authentification admin)
- Liste des fiches **en attente** avec actions : Valider / Rejeter / Éditer
- Liste de tous les artisans (search, filtre statut)
- Création manuelle d'une fiche artisan (saisie équipe)
- Édition complète d'une fiche
- Suppression (soft delete)
- Tableau de bord : nombre de fiches totales / en attente / validées

---

## Règles métier

- Un artisan peut avoir **plusieurs métiers**
- Un artisan peut couvrir **plusieurs communes**
- Une fiche n'est **jamais visible publiquement** avant validation admin
- Le **SIRET est unique** dans la base (pas de doublon)
- Un email de contact artisan = **obligatoire** (même si masqué au public)

### F06 — Dépôt de besoin (particulier connecté)

- Accessible depuis la homepage pour les utilisateurs avec rôle `particulier`
- Toggle UI : "🔍 Trouver un artisan" / "📋 Mon projet"
- Champs : prénom (pré-rempli depuis le compte), type de métier, commune, description (max 1000 car.), photos (optionnel)
- Upload max **6 photos** (JPG/PNG/WEBP, 5 Mo/photo), stockées dans `/public/uploads/besoins/`
- Statut initial du besoin : `NOUVEAU`
- Confirmation visuelle onomatopée BD : "Top !"
- Prénom persisté sur le compte artisan à chaque soumission

### F07 — Vue artisan : besoins correspondants

- Accessible depuis la homepage pour les utilisateurs avec rôle `artisan`
- Section "Vous pourriez les intéresser" avec split panel (même pattern que HeroSearch)
- Filtrage automatique par métier(s) ET commune(s) de la fiche artisan
- Panneau détail : description, badges métier/commune, date, galerie photos 3 cols
- Lightbox photos au clic (overlay plein écran, fermeture fond ou bouton ✕)
- Bouton "💬 Contacter" (placeholder, messagerie à implémenter)

---

## Non-périmètre V1

- Messagerie interne entre client et artisan (email seulement en V1)
- Paiement ou abonnement (Phase 4)
- Espace artisan complet avec tableau de bord (Phase 2+)
- Carte interactive (Backlog)
- Espace particulier : liste des besoins publiés (Phase 2+)
