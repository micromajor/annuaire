"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Artisan, ArtisanMetier, Metier, ArtisanCommune, Commune } from "@prisma/client";
import SiretVerifBadge from "@/components/features/SiretVerifBadge";

type ArtisanWithRelations = Artisan & {
  metiers: (ArtisanMetier & { metier: Metier })[];
  communes: (ArtisanCommune & { commune: Commune })[];
};

type MetierOption = { id: string; slug: string; label: string };

function CheckBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
        ok
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-orange-300 bg-orange-50 text-orange-600"
      }`}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}

export default function AdminArtisanRow({
  artisan,
  allMetiers = [],
}: {
  artisan: ArtisanWithRelations;
  allMetiers?: MetierOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"valider" | "rejeter" | null>(null);
  const [done, setDone] = useState<"VALIDE" | "REJETE" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignedLabel, setAssignedLabel] = useState<string | null>(null);
  const [showAssignSelect, setShowAssignSelect] = useState(false);
  const [selectedMetierSlug, setSelectedMetierSlug] = useState("");
  const [assignExistingLoading, setAssignExistingLoading] = useState(false);
  const [currentMetierSlugs, setCurrentMetierSlugs] = useState<string[]>(
    artisan.metiers.map((m) => m.metier.slug)
  );

  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metierLabels = artisan.metiers.map((m) => m.metier.label);
  const communeLabels = artisan.communes.map((c) => c.commune.nom);

  async function handleAction(action: "valider" | "rejeter") {
    setLoading(action);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/artisans/${artisan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(action === "valider" ? "VALIDE" : "REJETE");
        setTimeout(() => router.refresh(), 600);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setActionError(data.error ?? `Erreur ${res.status} — réessaie.`);
      }
    } catch {
      setActionError("Erreur réseau — vérifie que le serveur tourne.");
    } finally {
      setLoading(null);
    }
  }

  async function handleAssignerMetierLibre() {
    setAssignLoading(true);
    try {
      const res = await fetch(`/api/admin/artisans/${artisan.id}/metier-libre`, {
        method: "POST",
      });
      const data = (await res.json()) as { ok?: boolean; metier?: { label: string } };
      if (res.ok && data.metier) {
        setAssignedLabel(data.metier.label);
        setTimeout(() => router.refresh(), 800);
      }
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleAssignerExistant() {
    if (!selectedMetierSlug) return;
    setAssignExistingLoading(true);
    try {
      const res = await fetch(`/api/admin/artisans/${artisan.id}/metiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metierSlug: selectedMetierSlug }),
      });
      const data = (await res.json()) as { ok?: boolean; metier?: { slug: string; label: string } };
      if (res.ok && data.metier) {
        setCurrentMetierSlugs((prev) => [...prev, data.metier!.slug]);
        setShowAssignSelect(false);
        setSelectedMetierSlug("");
        setTimeout(() => router.refresh(), 400);
      }
    } finally {
      setAssignExistingLoading(false);
    }
  }

  async function handleRetirerMetier(slug: string, label: string) {
    if (!confirm(`Retirer le métier « ${label} » de cet artisan ?`)) return;
    await fetch(`/api/admin/artisans/${artisan.id}/metiers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metierSlug: slug }),
    });
    setCurrentMetierSlugs((prev) => prev.filter((s) => s !== slug));
    setTimeout(() => router.refresh(), 400);
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
    <article className="bd-card overflow-hidden">
      {/* Bandeau contextuel */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#ffd93d] px-5 py-2">
        <span className="text-sm font-bold text-[#1a1a2e]">🆕 Nouvelle inscription</span>
        <span className="rounded-full border-2 border-[#1a1a1a] bg-white px-3 py-0.5 text-xs font-bold text-[#1a1a2e]">
          Soumis le {new Date(artisan.createdAt).toLocaleDateString("fr-FR")}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Infos */}
        <div className="flex-1 space-y-4">
          {/* Identité */}
          <div className="flex flex-wrap items-center gap-3">
            {artisan.logoUrl ? (
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
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xl text-gray-300">
                🖼️
              </div>
            )}
            <div>
              <h3 className="text-lg font-black text-[#1a1a2e]">{nomAffiche}</h3>
              <p className="text-sm text-gray-500">
                {artisan.prenom} {artisan.nom}
              </p>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="grid gap-1 text-sm text-gray-600">
            <p>
              ✉️{" "}
              <a href={`mailto:${artisan.email}`} className="underline">
                {artisan.email}
              </a>
            </p>
            {artisan.telephone ? (
              <p>📞 {artisan.telephone}</p>
            ) : (
              <p className="text-orange-400">
                📞 <span className="italic">Numéro manquant</span>
              </p>
            )}
            {artisan.siret && (
              <div>
                <p className="text-sm text-gray-600">
                  🏢 SIRET : <span className="font-mono">{artisan.siret}</span>
                </p>
                <SiretVerifBadge siret={artisan.siret} />
              </div>
            )}
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
          </div>

          {/* Métiers */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">Métiers</p>
              {allMetiers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAssignSelect((v) => !v)}
                  className="rounded-full border border-[#1a1a1a] bg-[#fff8f0] px-2 py-0.5 text-xs font-bold text-[#1a1a2e] hover:bg-[#ffd93d]"
                >
                  {showAssignSelect ? "✕" : "+ Assigner"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {artisan.metiers.map((m) => (
                <span
                  key={m.metier.slug}
                  className="group flex items-center gap-1 rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] py-0.5 pr-1 pl-2.5 text-xs font-bold text-[#1a1a2e]"
                >
                  🔧 {m.metier.label}
                  <button
                    type="button"
                    onClick={() => handleRetirerMetier(m.metier.slug, m.metier.label)}
                    className="ml-0.5 rounded-full px-1 text-[#1a1a1a]/40 hover:bg-[#ff6b6b] hover:text-white"
                    title="Retirer ce métier"
                  >
                    ×
                  </button>
                </span>
              ))}
              {artisan.metierLibre && !assignedLabel ? (
                <>
                  <span className="rounded-full border-2 border-orange-400 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                    📝 Suggéré : « {artisan.metierLibre} »
                  </span>
                  <button
                    type="button"
                    onClick={handleAssignerMetierLibre}
                    disabled={assignLoading}
                    className="rounded-full border-2 border-[#6bcb77] bg-[#6bcb77] px-2.5 py-0.5 text-xs font-bold text-[#1a1a2e] hover:bg-[#5ab868] disabled:opacity-60"
                  >
                    {assignLoading ? "⏳" : "✅ Créer & assigner"}
                  </button>
                </>
              ) : assignedLabel ? (
                <span className="rounded-full border-2 border-green-400 bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                  ✅ « {assignedLabel} » créé et assigné
                </span>
              ) : null}
              {artisan.metiers.length === 0 && !artisan.metierLibre && !assignedLabel ? (
                <span className="rounded-full border-2 border-orange-300 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                  ⚠️ Aucun métier renseigné
                </span>
              ) : null}
            </div>
            {showAssignSelect && allMetiers.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={selectedMetierSlug}
                  onChange={(e) => setSelectedMetierSlug(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-[#1a1a1a] bg-white px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-[#6bcb77] focus:outline-none"
                >
                  <option value="">— Choisir un métier existant —</option>
                  {allMetiers
                    .filter((m) => !currentMetierSlugs.includes(m.slug))
                    .map((m) => (
                      <option key={m.slug} value={m.slug}>
                        {m.label}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignerExistant}
                  disabled={!selectedMetierSlug || assignExistingLoading}
                  className="rounded-lg border-2 border-[#1a1a1a] bg-[#6bcb77] px-3 py-1 text-xs font-bold hover:bg-[#5ab865] disabled:opacity-50"
                  style={{ boxShadow: "1px 1px 0 #1a1a1a" }}
                >
                  {assignExistingLoading ? "⏳" : "✅ Assigner"}
                </button>
              </div>
            )}
          </div>

          {/* Zones */}
          <div>
            <p className="mb-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
              Zones d&apos;intervention
            </p>
            {communeLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {communeLabels.map((nom) => (
                  <span
                    key={nom}
                    className="rounded-full border-2 border-[#1a1a1a] bg-[#e0f7e9] px-2.5 py-0.5 text-xs font-bold text-[#1a1a2e]"
                  >
                    📍 {nom}
                  </span>
                ))}
              </div>
            ) : (
              <span className="rounded-full border-2 border-orange-300 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                ⚠️ Aucune zone renseignée
              </span>
            )}
          </div>

          {/* Description */}
          {artisan.description ? (
            <p className="rounded-lg bg-[#fff8f0] p-3 text-sm whitespace-pre-wrap text-gray-500 italic">
              &ldquo;{artisan.description}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Pas de description</p>
          )}

          {/* Checklist complétude */}
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <CheckBadge ok={!!artisan.siret} label="SIRET" />
            <CheckBadge ok={!!artisan.telephone} label="Téléphone" />
            <CheckBadge ok={!!artisan.logoUrl} label="Logo" />
            <CheckBadge ok={!!artisan.description} label="Description" />
            <CheckBadge ok={!!artisan.siteWeb} label="Site web" />
            <CheckBadge ok={metierLabels.length > 0 || !!artisan.metierLibre} label="Métier(s)" />
            <CheckBadge ok={communeLabels.length > 0} label="Zone(s)" />
          </div>
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
          {actionError && (
            <p className="mt-1 rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
              ⚠️ {actionError}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
