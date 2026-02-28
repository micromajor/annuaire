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
    // ── Étape 1 — Formulaire visible en permanence
    {
      target: "edit-form",
      title: "Votre formulaire de fiche",
      content:
        "C'est ici que vous renseignez <strong>toutes vos informations</strong>. Le formulaire est toujours accessible — modifiez à tout moment !",
      placement: "bottom",
      spotlightPadding: 10,
    },
    // ── Étape 2 — Identité (prénom, nom, raison sociale)
    {
      target: "identity-section",
      title: "Identité",
      content:
        "Renseignez votre <strong>prénom</strong>, <strong>nom</strong> et si vous avez une société, votre <strong>raison sociale</strong> (ex : Maçonnerie Dupont SARL).",
      actionHint:
        "✏️ Remplissez vos informations d'identité, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "bottom",
      spotlightPadding: 8,
    },
    // ── Étape 3 — Contact (téléphone, site web, SIRET)
    {
      target: "contact-section",
      title: "Contact & SIRET",
      content:
        "Votre <strong>téléphone</strong> est affiché sur votre fiche publique. Le <strong>SIRET</strong> vous donne le badge ✓ Pro vérifié rassurant pour les clients.",
      actionHint:
        "📞 Ajoutez votre téléphone et votre SIRET (14 chiffres), puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "bottom",
      spotlightPadding: 8,
    },
    // ── Étape 4 — Présentation
    {
      target: "description-section",
      title: "Votre présentation",
      content:
        "Ce texte apparaît sur votre fiche publique. Parlez de votre <strong>expérience</strong>, vos <strong>spécialités</strong> et ce qui vous différencie.",
      actionHint:
        "📝 Rédigez votre présentation (quelques lignes suffisent), puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "top",
      spotlightPadding: 8,
    },
    // ── Étape 5 — Métiers
    {
      target: "metiers-section",
      title: "Votre ou vos métiers",
      content:
        "Choisissez les <strong>métiers</strong> qui vous décrivent le mieux. Vous pouvez en ajouter plusieurs — c'est ce qui détermine dans quelles recherches vous apparaissez.",
      actionHint:
        "🔨 Sélectionnez vos métiers dans la liste, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "top",
      spotlightPadding: 8,
    },
    // ── Étape 6 — Zones d'intervention
    {
      target: "zones-section",
      title: "Zones d'intervention",
      content:
        "Indiquez les <strong>communes</strong> où vous intervenez. Plus vous en ajoutez, plus vous êtes visible auprès des particuliers de la zone.",
      actionHint:
        "📍 Sélectionnez vos communes sur la carte, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "top",
      spotlightPadding: 8,
    },
    // ── Étape 7 — Phrase d'accroche (interactive : saisie libre)
    {
      target: "accroche-field",
      title: "Phrase d'accroche",
      content:
        "Une <strong>phrase courte et percutante</strong> affichée en évidence sur votre fiche.<br/>Ex : <em>« Maçon depuis 20 ans, devis gratuit sous 48h. »</em>",
      actionHint: "✏️ Tapez votre phrase d'accroche, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "bottom",
    },
    // ── Étape 8 — Réseaux sociaux (interactive : saisie optionnelle)
    {
      target: "social-section",
      title: "Réseaux sociaux",
      content:
        "Ajoutez vos profils <strong>Instagram, Facebook, YouTube, LinkedIn ou WhatsApp</strong>… Ils apparaissent sur votre fiche publique et rassurent les clients.",
      actionHint: "🌐 Collez vos liens si vous en avez, puis cliquez <strong>C'est fait</strong>.",
      interactive: true,
      placement: "bottom",
    },
    // ── Étape 9 — Enregistrer (action : clic sur le bouton submit)
    {
      target: "btn-enregistrer",
      title: "Enregistrez vos modifications",
      content:
        "Tout est rempli ? <strong>Cliquez sur Enregistrer</strong> pour sauvegarder. Vos informations sont mises à jour instantanément.",
      actionHint: "💾 Cliquez sur <strong>Enregistrer ma fiche</strong> pour valider.",
      action: { type: "click", selector: "[data-tuto='btn-enregistrer']" },
      placement: "top",
      spotlightPadding: 12,
    },
    // ── Étape 10 — Aperçu public
    {
      target: "fiche-card",
      title: "Votre aperçu public",
      content:
        "Ce bloc montre ce que <strong>les particuliers voient</strong> en cherchant votre métier. Vérifiez que tout est bien renseigné.",
      placement: "top",
      spotlightPadding: 10,
    },
    // ── Étape 11 — Partage
    {
      target: "share-zone",
      title: "Partagez votre fiche",
      content:
        "<strong>Partagez votre lien</strong> sur WhatsApp, par email ou sur les réseaux — plus vous la diffusez, plus vous recevez de demandes !",
      placement: "top",
    },
    // ── Étape 12 — Messages
    {
      target: "messages-link",
      title: "Vos messages clients",
      content:
        "Quand un particulier vous contacte, son message apparaît ici. <strong>Répondez vite</strong> : les artisans réactifs décrochent plus de chantiers !",
      placement: "top",
    },
    // ── Étape 13 — Portfolio
    {
      target: "portfolio-card",
      title: "Photos de vos chantiers",
      content:
        "Ajoutez des <strong>photos de vos réalisations</strong>. Les clients choisissent plus facilement un artisan dont ils ont vu les chantiers.",
      placement: "top",
    },
    // ── Étape 14 — Fin (modal centré)
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
