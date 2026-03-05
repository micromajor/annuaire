"use client";

import { useState } from "react";

interface Commune {
  id: string;
  nom: string;
  codePostal: string;
}

interface CommunesListProps {
  communes: Commune[];
  /** Nombre de communes à afficher avant le bouton "voir plus" (défaut: 5) */
  initialCount?: number;
}

export default function CommunesList({ communes, initialCount = 5 }: CommunesListProps) {
  const [expanded, setExpanded] = useState(false);

  // Trier les communes par nom
  const sortedCommunes = [...communes].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  // Sur mobile: afficher seulement les premières, sur desktop: tout afficher
  const shouldCollapse = sortedCommunes.length > initialCount;
  const visibleCommunes = expanded ? sortedCommunes : sortedCommunes.slice(0, initialCount);
  const hiddenCount = sortedCommunes.length - initialCount;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleCommunes.map((commune) => (
        <span key={commune.id} className="bd-badge bd-badge-bleu">
          📍 {commune.nom} ({commune.codePostal})
        </span>
      ))}

      {/* Bouton voir plus / moins — uniquement sur mobile */}
      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="bd-badge cursor-pointer border-2 border-dashed border-[#1a1a2e]/30 bg-transparent text-[#1a1a2e]/70 transition-colors hover:bg-[#1a1a2e]/5 sm:hidden"
        >
          {expanded ? "▲ Voir moins" : `+${hiddenCount} commune${hiddenCount > 1 ? "s" : ""}`}
        </button>
      )}

      {/* Sur desktop: toujours afficher toutes les communes */}
      {shouldCollapse && !expanded && (
        <span className="hidden sm:contents">
          {sortedCommunes.slice(initialCount).map((commune) => (
            <span key={commune.id} className="bd-badge bd-badge-bleu">
              📍 {commune.nom} ({commune.codePostal})
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
