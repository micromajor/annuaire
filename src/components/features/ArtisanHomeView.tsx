"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MatchingBesoins from "@/components/features/MatchingBesoins";
import type { BesoinItem } from "@/components/features/MatchingBesoins";

const ArtisanHomeMap = dynamic(() => import("@/components/features/ArtisanHomeMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-64 items-center justify-center rounded-2xl text-sm font-bold text-gray-400"
      style={{ border: "3px dashed rgba(26,26,46,0.2)" }}
    >
      🗺️ Chargement de la carte…
    </div>
  ),
});

type View = "liste" | "carte";

export default function ArtisanHomeView({
  besoins,
  artisanCommunes,
}: {
  besoins: BesoinItem[];
  artisanCommunes: string[];
}) {
  const [view, setView] = useState<View>("liste");

  return (
    <div>
      {/* Toggle Liste / Carte — style identique au ParticulierHome */}
      <div className="mb-8 flex justify-center">
        <div
          className="flex overflow-hidden rounded-2xl border-3 border-[#1a1a1a]"
          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
        >
          <button
            onClick={() => setView("liste")}
            className="bd-titre px-6 py-3 text-base transition-colors"
            style={
              view === "liste"
                ? { background: "#1a1a2e", color: "#6bcb77" }
                : { background: "white", color: "#1a1a2e" }
            }
          >
            📋 Liste
          </button>
          <button
            onClick={() => setView("carte")}
            className="bd-titre border-l-3 border-[#1a1a1a] px-6 py-3 text-base transition-colors"
            style={
              view === "carte"
                ? { background: "#1a1a2e", color: "#6bcb77" }
                : { background: "white", color: "#1a1a2e" }
            }
          >
            🗺️ Carte
          </button>
        </div>
      </div>

      {view === "liste" ? (
        <MatchingBesoins besoins={besoins} />
      ) : (
        <ArtisanHomeMap besoins={besoins} artisanCommunes={artisanCommunes} />
      )}
    </div>
  );
}
