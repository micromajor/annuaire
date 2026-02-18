"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Artisan, ArtisanMetier, Metier, ArtisanCommune, Commune } from "@prisma/client";

type ArtisanWithRelations = Artisan & {
  metiers: (ArtisanMetier & { metier: Metier })[];
  communes: (ArtisanCommune & { commune: Commune })[];
};

interface DraftData {
  raisonSociale?: string | null;
  siret?: string | null;
  telephone?: string | null;
  siteWeb?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  metierLabels?: string[];
  communeLabels?: string[];
}

export default function AdminArtisanRow({
  artisan,
  isDraft = false,
}: {
  artisan: ArtisanWithRelations;
  isDraft?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"valider" | "rejeter" | null>(null);
  const [done, setDone] = useState<"VALIDE" | "REJETE" | null>(null);

  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metierLabels = artisan.metiers.map((m) => m.metier.label).join(", ");
  const communeLabels = artisan.communes.map((c) => c.commune.nom).join(", ");

  async function handleAction(action: "valider" | "rejeter") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/artisans/${artisan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(action === "valider" ? "VALIDE" : "REJETE");
        // Refresh les stats côté serveur après un délai
        setTimeout(() => router.refresh(), 600);
      }
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <div
        className={`rounded-xl border-2 border-[#1a1a1a] p-4 text-center font-bold transition-all ${
          done === "VALIDE" ? "bg-[#6bcb77] text-white" : "bg-[#ff6b6b] text-white"
        }`}
      >
        {done === "VALIDE" ? "✅ Validé — " : "❌ Rejeté — "}
        {nomAffiche}
      </div>
    );
  }

  return (
    <article className={`bd-card overflow-hidden ${isDraft ? "border-[#a78bfa]" : ""}`}>
      {isDraft && (
        <div className="bg-[#a78bfa] px-5 py-2 text-sm font-bold text-white">
          ✏️ Modifications proposées par l&apos;artisan — la fiche publiée reste visible
        </div>
      )}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Infos */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Logo */}
            {artisan.logoUrl && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-[#1a1a1a] bg-white">
                <Image
                  src={artisan.logoUrl}
                  alt={`Logo ${nomAffiche}`}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">{nomAffiche}</h3>
                {artisan.siret && (
                  <span className="bd-badge bd-badge-jaune text-xs">SIRET {artisan.siret}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-1 text-sm text-gray-600">
            <p>
              👤 {artisan.prenom} {artisan.nom}
            </p>
            <p>
              ✉️{" "}
              <a href={`mailto:${artisan.email}`} className="underline">
                {artisan.email}
              </a>
            </p>
            {artisan.telephone && <p>📞 {artisan.telephone}</p>}
            {artisan.siteWeb && (
              <p>
                🌐{" "}
                <a
                  href={artisan.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {artisan.siteWeb}
                </a>
              </p>
            )}
            <p>🔧 {metierLabels}</p>
            <p>📍 {communeLabels}</p>
          </div>

          {artisan.description && (
            <p className="rounded-lg bg-[#fff8f0] p-3 text-sm text-gray-500 italic">
              &ldquo;{artisan.description}&rdquo;
            </p>
          )}

          {/* Diff draft vs live */}
          {isDraft &&
            artisan.draftData &&
            (() => {
              const draft = artisan.draftData as DraftData;
              return (
                <div className="space-y-2 rounded-xl border-2 border-[#a78bfa] bg-[#f5f0ff] p-4 text-sm">
                  <p className="font-bold text-[#7c3aed]">📋 Modifications demandées :</p>
                  {draft.raisonSociale !== artisan.raisonSociale && (
                    <Diff
                      label="Raison sociale"
                      before={artisan.raisonSociale}
                      after={draft.raisonSociale}
                    />
                  )}
                  {draft.siret !== artisan.siret && (
                    <Diff label="SIRET" before={artisan.siret} after={draft.siret} />
                  )}
                  {draft.telephone !== artisan.telephone && (
                    <Diff label="Téléphone" before={artisan.telephone} after={draft.telephone} />
                  )}
                  {draft.siteWeb !== artisan.siteWeb && (
                    <Diff label="Site web" before={artisan.siteWeb} after={draft.siteWeb} />
                  )}
                  {draft.logoUrl !== artisan.logoUrl && (
                    <Diff label="Logo URL" before={artisan.logoUrl} after={draft.logoUrl} />
                  )}
                  {draft.description !== artisan.description && (
                    <Diff
                      label="Description"
                      before={artisan.description}
                      after={draft.description}
                    />
                  )}
                  {draft.metierLabels && (
                    <Diff
                      label="Métiers"
                      before={artisan.metiers.map((m) => m.metier.label).join(", ")}
                      after={draft.metierLabels.join(", ")}
                    />
                  )}
                  {draft.communeLabels && (
                    <Diff
                      label="Communes"
                      before={artisan.communes.map((c) => c.commune.nom).join(", ")}
                      after={draft.communeLabels.join(", ")}
                    />
                  )}
                </div>
              );
            })()}

          <p className="text-xs text-gray-400">
            Soumis le {new Date(artisan.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:flex-col">
          <button
            onClick={() => handleAction("valider")}
            disabled={!!loading}
            className="bd-btn bd-btn-primary flex-1 disabled:opacity-60 sm:flex-none"
          >
            {loading === "valider" ? "..." : "✅ Valider"}
          </button>
          <button
            onClick={() => handleAction("rejeter")}
            disabled={!!loading}
            className="bd-btn bd-btn-outline flex-1 border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b] hover:text-white disabled:opacity-60 sm:flex-none"
          >
            {loading === "rejeter" ? "..." : "❌ Rejeter"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Diff({
  label,
  before,
  after,
}: {
  label: string;
  before?: string | null;
  after?: string | null;
}) {
  if (before === after) return null;
  return (
    <div>
      <span className="font-semibold text-gray-600">{label} : </span>
      <span className="text-red-400 line-through">{before || "—"}</span>
      {" → "}
      <span className="font-bold text-[#16a34a]">{after || "—"}</span>
    </div>
  );
}
