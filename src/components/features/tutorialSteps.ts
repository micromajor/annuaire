// Étapes du tutoriel par rôle — extensibles au fur et à mesure des nouvelles fonctionnalités
// Pour ajouter une étape : ajouter un objet dans le tableau correspondant.
// target = valeur de l'attribut data-tuto sur l'élément DOM cible (omit = modal centré)

export interface TutorialStep {
  target?: string; // data-tuto="..." sur l'élément DOM
  title: string; // supporte {prenom}
  content: string; // HTML léger autorisé (<strong>, <em>, <br>)
  /** Instruction mise en avant sous le contenu (ex: "👆 Cliquez sur Modifier") */
  actionHint?: string;
  /** Écoute un clic sur un élément pour passer automatiquement à l'étape suivante */
  action?: { type: "click"; selector: string };
  /** Libère l'overlay sur le spotlight pour permettre l'interaction (saisie, clic) */
  interactive?: boolean;
  placement?: "top" | "bottom";
  spotlightPadding?: number;
}

export const TUTORIAL_STEPS: Record<"artisan" | "particulier", TutorialStep[]> = {
  artisan: [
    // ── Étape 0 — Bienvenue (modal centré)
    {
      title: "Bienvenue{prenom} ! 🎉",
      content:
        "Ce guide vous montre <strong>pas à pas</strong> comment bien configurer votre espace — ça prend moins de 5 minutes. Suivez les instructions en bas de chaque bulle !",
    },
    // ── Étape 1 — Ouvrir le formulaire (action : clic sur Modifier)
    {
      target: "edit-form",
      title: "Votre fiche artisan",
      content:
        "C'est ici que vous renseignez <strong>toutes vos informations</strong> : nom, métiers, zones d'intervention, téléphone, SIRET…",
      actionHint:
        "👆 Cliquez sur le bouton <strong>Modifier</strong> pour ouvrir votre formulaire.",
      action: { type: "click", selector: "[data-tuto='btn-modifier']" },
      placement: "bottom",
      spotlightPadding: 10,
    },
    // ── Étape 2 — Phrase d'accroche (interactive : saisie libre)
    {
      target: "accroche-field",
      title: "Phrase d'accroche",
      content:
        'Une <strong>phrase courte et percutante</strong> affichée en évidence sur votre fiche et votre carte de partage.<br/>Ex : <em>"Maçon depuis 20 ans, devis gratuit sous 48h."</em>',
      actionHint:
        "✏️ Tapez votre phrase d'accroche dans le champ, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "bottom",
    },
    // ── Étape 3 — Réseaux sociaux (interactive : saisie optionnelle)
    {
      target: "social-section",
      title: "Vos réseaux sociaux",
      content:
        "Ajoutez vos profils <strong>Instagram, Facebook, YouTube</strong>… Ils apparaissent sur votre image de partage et rassurent les clients avant de vous contacter.",
      actionHint: "🌐 Collez vos liens si vous en avez, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "bottom",
    },
    // ── Étape 4 — Enregistrer (action : clic sur le bouton submit)
    {
      target: "btn-enregistrer",
      title: "Enregistrez vos modifications",
      content:
        "Une fois vos informations remplies, <strong>cliquez sur Enregistrer</strong> pour les sauvegarder. Vos données sont mises à jour instantanément.",
      actionHint: "💾 Cliquez sur <strong>Enregistrer ma fiche</strong> pour valider.",
      action: { type: "click", selector: "[data-tuto='btn-enregistrer']" },
      placement: "top",
      spotlightPadding: 12,
    },
    // ── Étape 5 — Ma fiche (aperçu public)
    {
      target: "fiche-card",
      title: "Votre aperçu public",
      content:
        "Ce bloc montre ce que <strong>les particuliers voient</strong> en cherchant votre métier. Vérifiez que tout est bien renseigné avant de partager.",
      placement: "top",
      spotlightPadding: 10,
    },
    // ── Étape 6 — Partage
    {
      target: "share-zone",
      title: "Partagez votre fiche",
      content:
        "<strong>Partagez votre lien</strong> sur WhatsApp, par email ou sur les réseaux — plus vous la diffusez, plus vous recevez de demandes !",
      placement: "top",
    },
    // ── Étape 7 — Messages
    {
      target: "messages-link",
      title: "Vos messages clients",
      content:
        "Quand un particulier vous contacte, son message apparaît ici. <strong>Répondez vite</strong> : les artisans réactifs décrochent plus de chantiers !",
      placement: "top",
    },
    // ── Étape 8 — Portfolio
    {
      target: "portfolio-card",
      title: "Photos de vos chantiers",
      content:
        "Ajoutez des <strong>photos de vos réalisations</strong>. Les clients choisissent plus facilement un artisan dont ils ont vu les chantiers.",
      placement: "top",
    },
    // ── Étape 9 — Fin (modal centré)
    {
      title: "Vous êtes prêt ! 🚀",
      content:
        "Votre espace est configuré. Ajoutez des photos, partagez votre lien, et les demandes arrivent !<br/><br/>Ce guide reste disponible à tout moment via le bouton <strong>?</strong> en bas à droite.",
    },
  ],

  particulier: [
    // ── Étape 0 — Bienvenue
    {
      title: "Bienvenue{prenom} ! 👋",
      content:
        "Voici votre <strong>espace personnel</strong>. Retrouvez ici toutes vos demandes publiées et vos échanges avec les artisans. Rapide à prendre en main !",
    },
    // ── Étape 1 — Messages
    {
      target: "messages-particulier",
      title: "Vos messages",
      content:
        "Quand un artisan répond à votre demande, son message apparaît ici. <strong>Consultez et répondez</strong> depuis cet espace.",
      placement: "bottom",
    },
    // ── Étape 2 — Annonces
    {
      target: "besoins-list",
      title: "Vos annonces",
      content:
        "Retrouvez ici <strong>toutes les demandes que vous avez publiées</strong>. Pour en créer une nouvelle, rendez-vous sur la page d'accueil.",
      placement: "top",
    },
    // ── Étape 3 — Fin
    {
      title: "C'est tout ! 🎉",
      content:
        "Besoin d'un artisan ? Revenez sur la <strong>page d'accueil</strong> pour déposer une nouvelles annonce — les artisans de votre zone vous répondront directement.<br/><br/>Ce guide est disponible à tout moment via le bouton <strong>?</strong> en bas à droite.",
    },
  ],
};
