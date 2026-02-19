"use client";

import Link from "next/link";
import { useState } from "react";
import type { METIERS } from "@/constants";
import Combobox from "@/components/ui/Combobox";
import { COMMUNES_NANTES_EST } from "@/constants";

interface HeroSearchProps {
  metiers: typeof METIERS;
}

const METIER_EMOJIS: Record<string, string> = {
  macon: "🧱",
  plombier: "🔧",
  electricien: "⚡",
  menuisier: "🪵",
  peintre: "🎨",
  couvreur: "🏠",
  carreleur: "🔲",
  chauffagiste: "🔥",
  plaquiste: "🪚",
  charpentier: "🔩",
};

type SearchResult = {
  id: string;
  prenom: string | null;
  nom: string | null;
  raisonSociale: string | null;
  logoUrl: string | null;
  siret: string | null;
  description: string | null;
  telephone: string | null;
  siteWeb: string | null;
  metiers: { metier: { slug: string; label: string } }[];
  communes: { commune: { nom: string } }[];
  avis: { note: number }[];
};

function getEmoji(slugs: string[]): string {
  for (const s of slugs) if (METIER_EMOJIS[s]) return METIER_EMOJIS[s];
  return "🔧";
}

/* ============================================================
   Sous-composant : Panneau détail
   ============================================================ */
function ArtisanPanel({ artisan, onClose }: { artisan: SearchResult; onClose: () => void }) {
  const nom = artisan.raisonSociale ?? `${artisan.prenom ?? ""} ${artisan.nom ?? ""}`.trim();
  const emoji = getEmoji(artisan.metiers.map((m) => m.metier.slug));
  const nbAvis = artisan.avis.length;
  const moyenne = nbAvis > 0 ? artisan.avis.reduce((s, a) => s + a.note, 0) / nbAvis : null;

  return (
    <div className="search-panel-enter bd-card overflow-hidden text-left">
      {/* En-tête */}
      <div className="border-b-3 border-[#1a1a1a] bg-[#fff8f0] px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {artisan.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artisan.logoUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border-2 border-[#1a1a1a] bg-white object-contain sm:h-20 sm:w-20"
              />
            ) : (
              <span className="shrink-0 text-3xl">{emoji}</span>
            )}
            <div className="min-w-0">
              <h2 className="bd-titre text-lg leading-tight text-[#1a1a2e] sm:text-xl">{nom}</h2>
              {artisan.raisonSociale && (
                <p className="truncate text-xs text-gray-500">
                  {artisan.prenom} {artisan.nom}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {artisan.siret && <span className="bd-badge bd-badge-vert text-xs">✓ Pro</span>}
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full border-2 border-[#1a1a1a]/20 p-1 text-sm font-bold text-[#1a1a1a]/40 transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {artisan.metiers.map(({ metier }) => (
            <span key={metier.slug} className="bd-badge bd-badge-jaune text-xs">
              {metier.label}
            </span>
          ))}
        </div>
      </div>

      {/* Corps */}
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {(artisan.telephone || artisan.siteWeb) && (
          <div className="flex flex-col gap-2">
            {artisan.telephone && (
              <a
                href={`tel:${artisan.telephone.replace(/\s/g, "")}`}
                className="bd-btn bd-btn-primary w-full justify-center"
              >
                📞 {artisan.telephone}
              </a>
            )}
            {artisan.siteWeb && (
              <a
                href={artisan.siteWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="bd-btn bd-btn-outline w-full justify-center text-sm"
              >
                🌐 Visiter le site
              </a>
            )}
          </div>
        )}

        {artisan.description && (
          <div>
            <p className="mb-1 text-xs font-black tracking-wider text-[#1a1a2e]/50 uppercase">
              À propos
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{artisan.description}</p>
          </div>
        )}

        {moyenne !== null && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }, (_, idx) => (
                <span
                  key={idx}
                  className={idx < Math.round(moyenne!) ? "text-[#ffd93d]" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {moyenne.toFixed(1)} / 5 ({nbAvis} avis)
            </span>
          </div>
        )}

        <Link
          href={`/artisans/${artisan.id}`}
          className="bd-btn w-full justify-center"
          style={{ background: "#ff6b6b", color: "white", boxShadow: "3px 3px 0 #1a1a1a" }}
        >
          Voir la fiche complète →
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   Composant principal
   ============================================================ */
export default function HeroSearch({ metiers }: HeroSearchProps) {
  const [metier, setMetier] = useState("");
  const [commune, setCommune] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const metierOptions = metiers.map((m) => ({ value: m.slug, label: m.label }));
  const communeOptions = COMMUNES_NANTES_EST.map((c) => ({
    value: c.nom,
    label: c.nom,
    sub: c.codePostal,
  }));

  async function handleSearch() {
    setLoading(true);
    setResults(null);
    setSelectedId(null);
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
    if (commune) params.set("commune", commune);
    const res = await fetch(`/api/artisans/search?${params}`);
    const data: SearchResult[] = await res.json();
    setResults(data);
    setLoading(false);
  }

  const selected = results?.find((r) => r.id === selectedId) ?? null;

  const queryString = (() => {
    const p = new URLSearchParams();
    if (metier) p.set("metier", metier);
    if (commune) p.set("commune", commune);
    return p.toString();
  })();

  return (
    <div className="w-full">
      {/* ---- Barre de recherche ---- */}
      {/* Mobile : empilement vertical centré */}
      {/* Desktop : ligne horizontale */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-nowrap sm:justify-center sm:gap-x-3">
        <span className="bd-titre text-3xl text-[#1a1a2e] sm:shrink-0 sm:text-4xl">Trouver</span>

        <div className="flex w-full items-center gap-3 sm:contents">
          <Combobox
            options={metierOptions}
            value={metier}
            onChange={setMetier}
            placeholder="métier"
            allLabel="tous les métiers"
            className="min-w-0 flex-1 sm:w-52 sm:flex-none sm:shrink-0"
            variant="ghost"
          />

          <span className="bd-titre shrink-0 text-3xl text-[#1a1a2e] sm:text-4xl">sur</span>

          <Combobox
            options={communeOptions}
            value={commune}
            onChange={setCommune}
            placeholder="commune"
            allLabel="toute la zone"
            className="min-w-0 flex-1 sm:w-60 sm:flex-none sm:shrink-0"
            variant="ghost"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bd-titre flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border-3 border-[#1a1a1a] bg-[#ff6b6b] px-6 py-3 text-xl text-white transition-colors hover:bg-[#e05555] disabled:opacity-60 sm:w-auto"
          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
        >
          {loading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
          ) : (
            "🔍"
          )}
        </button>
      </div>

      {/* ---- Résultats ---- */}
      {results !== null && (
        <div className="mt-8 w-full">
          {results.length === 0 ? (
            <p className="search-result-enter text-center text-lg font-bold text-[#1a1a2e]">
              😕 Aucun artisan trouvé pour votre recherche.
            </p>
          ) : (
            <>
              {/* Bouton retour — mobile quand panel ouvert */}
              {selected && (
                <button
                  onClick={() => setSelectedId(null)}
                  className="mb-3 flex items-center gap-1 text-sm font-bold text-[#1a1a2e]/60 hover:text-[#1a1a2e] sm:hidden"
                >
                  ← Retour aux résultats
                </button>
              )}

              <p className="mb-3 text-xs font-bold tracking-widest text-[#1a1a2e]/50 uppercase">
                {results.length} résultat{results.length > 1 ? "s" : ""}
              </p>

              {/* Mobile : liste OU panel (pas les deux) */}
              {/* Desktop : split côte-à-côte animé */}
              <div className="flex items-start overflow-hidden">
                {/* ---- LISTE ---- */}
                <div
                  className={selected ? "hidden sm:block" : "block w-full"}
                  style={
                    selected
                      ? {
                          width: "38%",
                          flexShrink: 0,
                          transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                        }
                      : undefined
                  }
                >
                  <div className="flex flex-col gap-2">
                    {results.map((artisan, i) => {
                      const nom =
                        artisan.raisonSociale ??
                        `${artisan.prenom ?? ""} ${artisan.nom ?? ""}`.trim();
                      const emoji = getEmoji(artisan.metiers.map((m) => m.metier.slug));
                      const isSelected = artisan.id === selectedId;

                      return (
                        <button
                          key={artisan.id}
                          onClick={() => setSelectedId(artisan.id)}
                          className="search-result-enter bd-card w-full cursor-pointer text-left"
                          style={{
                            animationDelay: `${i * 60}ms`,
                            ...(isSelected
                              ? {
                                  borderColor: "#ff6b6b",
                                  boxShadow: "4px 4px 0 #ff6b6b",
                                  background: "#fff0f0",
                                }
                              : {}),
                          }}
                        >
                          <div className="flex items-center gap-3 px-4 py-3">
                            {artisan.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={artisan.logoUrl}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-md border-2 border-[#1a1a1a] bg-white object-contain sm:h-16 sm:w-16"
                              />
                            ) : (
                              <span className="shrink-0 text-2xl">{emoji}</span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm leading-tight font-black text-[#1a1a2e] sm:text-base">
                                {nom}
                              </p>
                              <p className="truncate text-xs font-semibold text-gray-500">
                                {artisan.metiers.map((m) => m.metier.label).join(" · ")}
                              </p>
                              {!selected && artisan.communes.length > 0 && (
                                <p className="mt-0.5 truncate text-xs text-gray-400">
                                  📍{" "}
                                  {artisan.communes
                                    .slice(0, 2)
                                    .map((c) => c.commune.nom)
                                    .join(", ")}
                                  {artisan.communes.length > 2 &&
                                    ` +${artisan.communes.length - 2}`}
                                </p>
                              )}
                            </div>
                            {!selected && (
                              <span className="shrink-0 text-xs font-bold text-[#1a1a2e]/30">
                                →
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!selected && (
                    <div
                      className="search-result-enter mt-5 text-center"
                      style={{ animationDelay: `${results.length * 60 + 60}ms` }}
                    >
                      <Link
                        href={`/artisans${queryString ? `?${queryString}` : ""}`}
                        className="bd-btn inline-flex"
                        style={{
                          background: "#1a1a2e",
                          color: "white",
                          boxShadow: "3px 3px 0 #1a1a1a",
                        }}
                      >
                        Voir tous les résultats →
                      </Link>
                    </div>
                  )}
                </div>

                {/* ---- PANNEAU DÉTAIL ---- */}
                {/* Mobile : plein écran quand sélectionné */}
                {selected && (
                  <div
                    className="w-full sm:shrink-0"
                    style={
                      typeof window !== "undefined" && window.innerWidth >= 640
                        ? {
                            width: "62%",
                            paddingLeft: "1rem",
                            transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                          }
                        : undefined
                    }
                  >
                    <ArtisanPanel artisan={selected} onClose={() => setSelectedId(null)} />
                  </div>
                )}

                {/* Desktop : panel avec animation width */}
                <div
                  className="hidden shrink-0 overflow-hidden sm:block"
                  style={{
                    width: selected ? "62%" : "0%",
                    paddingLeft: selected ? "1rem" : "0",
                    transition:
                      "width 0.35s cubic-bezier(0.22, 1, 0.36, 1), padding-left 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {selected && (
                    <ArtisanPanel artisan={selected} onClose={() => setSelectedId(null)} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
