"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Avis } from "@prisma/client";

function Stars({ note }: { note: number }) {
  return (
    <span aria-label={`${note}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < note ? "text-[#ffd93d]" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AdminAvisRow({
  avis,
}: {
  avis: Avis & { artisan: { raisonSociale: string | null; prenom: string; nom: string } };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"valider" | "rejeter" | null>(null);
  const [done, setDone] = useState<"VALIDE" | "REJETE" | null>(null);

  const artisanNom = avis.artisan.raisonSociale ?? `${avis.artisan.prenom} ${avis.artisan.nom}`;

  async function handleAction(action: "valider" | "rejeter") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/avis/${avis.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(action === "valider" ? "VALIDE" : "REJETE");
        setTimeout(() => router.refresh(), 500);
      }
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <div
        className={`rounded-xl border-2 border-[#1a1a1a] p-4 text-center font-bold ${done === "VALIDE" ? "bg-[#6bcb77] text-white" : "bg-[#ff6b6b] text-white"}`}
      >
        {done === "VALIDE" ? "⭐ Avis publié —" : "❌ Rejeté —"} {avis.auteurPrenom}
      </div>
    );
  }

  return (
    <article className="bd-card overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] text-sm font-black text-[#1a1a2e]">
              {avis.auteurPrenom[0]?.toUpperCase()}
            </span>
            <div>
              <span className="font-black text-[#1a1a2e]">{avis.auteurPrenom}</span>
              <span className="ml-2 text-xs text-gray-400">{avis.auteurEmail}</span>
            </div>
            <Stars note={avis.note} />
          </div>
          <p className="text-sm text-gray-500">
            Pour : <span className="font-bold text-[#1a1a2e]">{artisanNom}</span>
          </p>
          <p className="rounded-lg bg-[#fff8f0] p-3 text-sm text-gray-700 italic">
            &ldquo;{avis.commentaire}&rdquo;
          </p>
          <p className="text-xs text-gray-400">
            Soumis le {new Date(avis.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <button
            onClick={() => handleAction("valider")}
            disabled={!!loading}
            className="bd-btn bd-btn-primary flex-1 disabled:opacity-60 sm:flex-none"
          >
            {loading === "valider" ? "…" : "⭐ Publier"}
          </button>
          <button
            onClick={() => handleAction("rejeter")}
            disabled={!!loading}
            className="bd-btn bd-btn-outline flex-1 border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b] hover:text-white disabled:opacity-60 sm:flex-none"
          >
            {loading === "rejeter" ? "…" : "❌ Rejeter"}
          </button>
        </div>
      </div>
    </article>
  );
}
