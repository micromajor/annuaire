import Link from "next/link";

interface ProfileCompletenessProps {
  hasLogo: boolean;
  hasDescription: boolean;
  hasAccroche: boolean;
  hasSiret: boolean;
  hasMetiers: boolean;
  hasCommunes: boolean;
  hasPortfolio: boolean;
  hasTelephone: boolean;
  hasSocial: boolean;
  artisanId: string;
}

/** Chaque étape pointe vers l'ancre du champ correspondant dans le formulaire */
const STEPS = [
  { key: "hasMetiers", label: "Métier(s) renseigné(s)", emoji: "🔨", anchor: "#section-metiers" },
  {
    key: "hasCommunes",
    label: "Zone d'intervention définie",
    emoji: "📍",
    anchor: "#section-communes",
  },
  {
    key: "hasDescription",
    label: "Description rédigée",
    emoji: "📝",
    anchor: "#section-description",
  },
  {
    key: "hasAccroche",
    label: "Phrase d'accroche ajoutée",
    emoji: "💬",
    anchor: "#section-accroche",
  },
  { key: "hasTelephone", label: "Téléphone renseigné", emoji: "📞", anchor: "#section-contact" },
  { key: "hasLogo", label: "Logo / photo ajouté", emoji: "🖼️", anchor: "#section-logo" },
  { key: "hasSiret", label: "SIRET renseigné", emoji: "📋", anchor: "#section-contact" },
  {
    key: "hasPortfolio",
    label: "Photos de chantier ajoutées",
    emoji: "📷",
    anchor: "#section-portfolio",
  },
  { key: "hasSocial", label: "Au moins un réseau social", emoji: "🔗", anchor: "#section-social" },
] as const;

function getEncouragementMessage(percent: number): { text: string; highlight: string } | null {
  if (percent < 25) {
    return {
      text: "Les profils complets reçoivent",
      highlight: "3× plus de demandes de la part des particuliers.",
    };
  }
  if (percent < 50) {
    return {
      text: "Bon début ! Continuez à compléter votre fiche pour",
      highlight: "apparaître en tête des résultats.",
    };
  }
  if (percent < 75) {
    return {
      text: "Plus que quelques champs ! Un profil complet inspire",
      highlight: "davantage confiance aux particuliers.",
    };
  }
  // 75-99%
  return {
    text: "Presque terminé ! Encore un petit effort pour",
    highlight: "atteindre le profil parfait. 💪",
  };
}

export default function ProfileCompleteness(props: ProfileCompletenessProps) {
  const completed = STEPS.filter((s) => props[s.key]).length;
  const total = STEPS.length;
  const percent = Math.round((completed / total) * 100);
  const isComplete = completed === total;

  if (isComplete) {
    return (
      <div
        className="rounded-2xl border-4 border-[#6bcb77] bg-[#f0fff4] p-5"
        style={{ boxShadow: "4px 4px 0 #6bcb77" }}
      >
        <p className="bd-titre text-lg text-[#166534]">🎉 Profil complet à 100% !</p>
        <p className="mt-1 text-sm text-[#166534]/70">
          Votre fiche est optimale. Les particuliers vous trouvent facilement.
        </p>
        <Link
          href={`/artisan/${props.artisanId}`}
          className="mt-3 inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-black text-[#166534] transition-colors hover:bg-[#6bcb77]/20"
          style={{ border: "2px solid #6bcb77" }}
        >
          Voir ma fiche publique →
        </Link>
      </div>
    );
  }

  // Tri : items restants en haut, complétés en bas
  const sortedSteps = [...STEPS].sort((a, b) => {
    const aDone = props[a.key] ? 1 : 0;
    const bDone = props[b.key] ? 1 : 0;
    return aDone - bDone;
  });

  const encouragement = getEncouragementMessage(percent);

  return (
    <div
      className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-5"
      style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="bd-titre text-lg text-[#1a1a2e]">Complétude du profil</h2>
        <span
          className={`rounded-full border-2 border-[#1a1a1a] px-3 py-0.5 text-sm font-black ${
            percent >= 75
              ? "bg-[#6bcb77] text-white"
              : percent >= 50
                ? "bg-[#ffd93d] text-[#1a1a2e]"
                : "bg-[#ff6b6b] text-white"
          }`}
        >
          {percent}%
        </span>
      </div>

      {/* Barre de progression */}
      <div className="mb-4 h-3 overflow-hidden rounded-full border-2 border-[#1a1a1a] bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: percent >= 75 ? "#6bcb77" : percent >= 50 ? "#ffd93d" : "#ff6b6b",
          }}
        />
      </div>

      {/* Checklist — items restants en haut, complétés en bas */}
      <ul className="space-y-1.5">
        {sortedSteps.map((step) => {
          const done = props[step.key];
          return (
            <li key={step.key}>
              {done ? (
                <span className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-400 line-through">
                  <span className="w-5 text-center">✅</span>
                  {step.label}
                </span>
              ) : (
                <a
                  href={step.anchor}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-[#ffd93d]/30"
                >
                  <span className="w-5 text-center">{step.emoji}</span>
                  <span className="flex-1">{step.label}</span>
                  <span className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Compléter →
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>

      {/* Message d'encouragement adaptatif */}
      {encouragement && (
        <p className="mt-3 rounded-lg bg-[#ffd93d]/20 px-3 py-2 text-xs text-[#1a1a2e]/70">
          💡 {encouragement.text} <strong>{encouragement.highlight}</strong>
        </p>
      )}
    </div>
  );
}
