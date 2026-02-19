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
      {/* Toggle Liste / Carte */}
      <div className="mb-5 flex justify-center gap-2">
        {(["liste", "carte"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="bd-btn px-6 py-2 text-sm font-black"
            style={
              view === v
                ? { background: "#1a1a2e", color: "#fff", boxShadow: "3px 3px 0 #6bcb77" }
                : { background: "white", color: "#1a1a2e", boxShadow: "3px 3px 0 #1a1a1a" }
            }
          >
            {v === "liste" ? "📋 Liste" : "🗺️ Carte"}
          </button>
        ))}
      </div>

      {view === "liste" ? (
        <MatchingBesoins besoins={besoins} />
      ) : (
        <ArtisanHomeMap besoins={besoins} artisanCommunes={artisanCommunes} />
      )}
    </div>
  );
}
