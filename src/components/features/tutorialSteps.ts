// Étapes du tutoriel par rôle — extensibles au fur et à mesure des nouvelles fonctionnalités
// Pour ajouter une étape : ajouter un objet dans le tableau correspondant.
// target = valeur de l'attribut data-tuto sur l'élément DOM cible (omit = modal centré)

export interface TutorialStep {
  target?: string; // data-tuto="..." sur l'élément DOM
  title: string; // supporte {prenom}
  content: string; // HTML léger autorisé (<strong>, <em>, <br>)
  placement?: "top" | "bottom"; // positionnement du tooltip (auto si omis)
  spotlightPadding?: number; // px de marge autour du spotlight (défaut: 8)
}

export const TUTORIAL_STEPS: Record<"artisan" | "particulier", TutorialStep[]> = {
  artisan: [
    // ── Étape 0 — Bienvenue (modal centré)
    {
      title: "Bienvenue{prenom} ! 🎉",
      content:
        "Voici votre <strong>espace artisan</strong>. Ce guide rapide vous montre l'essentiel en quelques clics. Vous pouvez l'ignorer à tout moment et le relancer via le bouton <strong>?</strong> en bas à droite.",
    },
    // ── Étape 1 — Formulaire de fiche
    {
      target: "edit-form",
      title: "Votre fiche",
      content:
        "C'est ici que vous <strong>complétez votre fiche</strong> : nom, métier, téléphone, SIRET, logo… Plus votre fiche est complète, plus les particuliers vous font confiance.",
      placement: "bottom",
      spotlightPadding: 10,
    },
    // ── Étape 2 — Phrase d'accroche
    {
      target: "accroche-field",
      title: "La phrase d'accroche",
      content:
        'Une <strong>phrase courte et percutante</strong> qui s\'affiche en évidence sur votre fiche publique et sur votre carte de partage. Ex : <em>"Maçon depuis 20 ans, devis gratuit sous 48h."</em>',
      placement: "bottom",
    },
    // ── Étape 3 — Réseaux sociaux
    {
      target: "social-section",
      title: "Vos réseaux sociaux",
      content:
        "Ajoutez vos profils <strong>Instagram, Facebook, YouTube</strong>… Ils apparaissent sur votre carte de partage et rassurent les clients avant de vous contacter.",
      placement: "bottom",
    },
    // ── Étape 4 — Ma fiche (aperçu public)
    {
      target: "fiche-card",
      title: "Votre aperçu public",
      content:
        "Ce bloc montre ce que <strong>les particuliers voient</strong> en cherchant votre métier. Vérifiez que tout est bien renseigné avant de partager votre lien.",
      placement: "top",
      spotlightPadding: 10,
    },
    // ── Étape 5 — Partage
    {
      target: "share-zone",
      title: "Partagez votre fiche",
      content:
        "<strong>Partagez votre lien</strong> sur WhatsApp, par email ou sur les réseaux — plus vous la diffusez, plus vous recevez de demandes ! Vous pouvez aussi voir l'image qui s'affiche quand vous partagez.",
      placement: "top",
    },
    // ── Étape 6 — Messages
    {
      target: "messages-link",
      title: "Vos messages clients",
      content:
        "Chaque fois qu'un particulier vous contacte, son message apparaît ici. <strong>Répondez vite</strong> : les artisans réactifs décrochent plus de chantiers !",
      placement: "top",
    },
    // ── Étape 7 — Portfolio
    {
      target: "portfolio-card",
      title: "Photos de vos chantiers",
      content:
        "Ajoutez des <strong>photos de vos réalisations</strong> pour montrer la qualité de votre travail. Les clients choisissent plus facilement un artisan dont ils ont vu les chantiers.",
      placement: "top",
    },
    // ── Étape 8 — Fin (modal centré)
    {
      title: "Vous êtes prêt ! 🚀",
      content:
        "Votre fiche est entre vos mains. Complétez-la, ajoutez des photos, et partagez votre lien. <strong>Bonne continuité !</strong><br/><br/>Ce guide est disponible à tout moment via le bouton <strong>?</strong> en bas à droite.",
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
