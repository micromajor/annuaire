interface ProfileCompletenessProps {
  hasLogo: boolean;
  hasDescription: boolean;
  hasAccroche: boolean;
  hasSiret: boolean;
  hasMetiers: boolean;
  hasCommunes: boolean;
  hasPortfolio: boolean;
  hasTelephone: boolean;
}

const STEPS = [
  { key: "hasMetiers", label: "Métier(s) renseigné(s)", emoji: "🔨" },
  { key: "hasCommunes", label: "Zone d'intervention définie", emoji: "📍" },
  { key: "hasDescription", label: "Description rédigée", emoji: "📝" },
  { key: "hasAccroche", label: "Phrase d'accroche ajoutée", emoji: "💬" },
  { key: "hasTelephone", label: "Téléphone renseigné", emoji: "📞" },
  { key: "hasLogo", label: "Logo / photo ajouté", emoji: "🖼️" },
  { key: "hasSiret", label: "SIRET renseigné", emoji: "📋" },
  { key: "hasPortfolio", label: "Photos de chantier ajoutées", emoji: "📷" },
] as const;

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
      </div>
    );
  }

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

      {/* Checklist */}
      <ul className="space-y-1.5">
        {STEPS.map((step) => {
          const done = props[step.key];
          return (
            <li
              key={step.key}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${
                done ? "text-gray-400 line-through" : "font-semibold text-[#1a1a2e]"
              }`}
            >
              <span className="w-5 text-center">{done ? "✅" : step.emoji}</span>
              {step.label}
            </li>
          );
        })}
      </ul>

      {percent < 50 && (
        <p className="mt-3 rounded-lg bg-[#ffd93d]/20 px-3 py-2 text-xs text-[#1a1a2e]/70">
          💡 Les profils complets reçoivent <strong>3× plus de demandes</strong> de la part des
          particuliers.
        </p>
      )}
    </div>
  );
}
