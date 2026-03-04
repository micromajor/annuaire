interface TrustBadgeProps {
  isVerified: boolean;
  hasFullProfile: boolean;
  avisCount: number;
  averageRating: number;
  size?: "sm" | "md";
}

/**
 * Badge de confiance gradué :
 * - ⭐ Vérifié (validation admin)
 * - ⭐⭐ Profil complet (logo + SIRET + portfolio + description)
 * - ⭐⭐⭐ Recommandé (5+ avis avec moyenne ≥ 4)
 */
export default function TrustBadge({
  isVerified,
  hasFullProfile,
  avisCount,
  averageRating,
  size = "sm",
}: TrustBadgeProps) {
  if (!isVerified) return null;

  const isRecommended = avisCount >= 5 && averageRating >= 4;
  const isComplete = hasFullProfile;

  const level = isRecommended ? 3 : isComplete ? 2 : 1;

  const config = {
    1: {
      label: "Vérifié",
      emoji: "✓",
      bg: "bg-[#6bcb77]/15",
      border: "border-[#6bcb77]",
      text: "text-[#166534]",
    },
    2: {
      label: "Profil complet",
      emoji: "✓✓",
      bg: "bg-[#38bdf8]/15",
      border: "border-[#38bdf8]",
      text: "text-[#0c4a6e]",
    },
    3: {
      label: "Recommandé",
      emoji: "★",
      bg: "bg-[#ffd93d]/25",
      border: "border-[#ffd93d]",
      text: "text-[#92400e]",
    },
  }[level];

  const sizeClasses = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 font-bold ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

/** Helper pour calculer si un profil est complet (niveau 2) */
export function hasFullProfile(artisan: {
  logoUrl: string | null;
  siret: string | null;
  description: string | null;
  portfolioPhotos: unknown;
}): boolean {
  return (
    !!artisan.logoUrl &&
    !!artisan.siret &&
    !!artisan.description &&
    Array.isArray(artisan.portfolioPhotos) &&
    artisan.portfolioPhotos.length > 0
  );
}
