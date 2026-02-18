"use client";

import { useState } from "react";

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

export type BesoinItem = {
  id: string;
  metierSlug: string;
  metierLabel: string;
  commune: string;
  description: string;
  prenom: string;
  photos: string[];
  createdAt: string;
};

/* ============================================================
   Panneau détail
   ============================================================ */
function BesoinPanel({ besoin, onClose }: { besoin: BesoinItem; onClose: () => void }) {
  const emoji = METIER_EMOJIS[besoin.metierSlug] ?? "🔧";
  const date = new Date(besoin.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="search-panel-enter bd-card overflow-hidden text-left">
      {/* En-tête */}
      <div
        className="border-b-3 border-[#1a1a1a] px-4 py-4 sm:px-5"
        style={{ background: "#f0fff4" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-3xl">{emoji}</span>
            <div className="min-w-0">
              <h2 className="bd-titre text-lg leading-tight text-[#1a1a2e] sm:text-xl">
                {besoin.prenom}
              </h2>
              <p className="text-xs text-gray-500">
                {besoin.metierLabel} · {besoin.commune}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border-2 border-[#1a1a1a] bg-white px-2 py-1 text-xs font-bold hover:bg-gray-50"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Corps */}
      <div className="space-y-4 p-4 sm:p-5">
        {/* Ce qu'ils cherchent */}
        <div>
          <p className="mb-1 text-xs font-black tracking-widest text-[#1a1a2e]/40 uppercase">
            Ce qu&apos;ils cherchent
          </p>
          <p className="text-sm leading-relaxed font-semibold text-[#1a1a2e]">
            {besoin.description}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="bd-badge bd-badge-jaune">
            {emoji} {besoin.metierLabel}
          </span>
          <span className="bd-badge">📍 {besoin.commune}</span>
        </div>

        <p className="text-xs text-gray-400 italic">Publié le {date}</p>

        {/* Photos */}
        {besoin.photos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-black tracking-widest text-[#1a1a2e]/40 uppercase">
              Photos du chantier
            </p>
            <div className="grid grid-cols-3 gap-2">
              {besoin.photos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="block aspect-square w-full overflow-hidden rounded-xl border-2 border-[#1a1a1a] transition-opacity hover:opacity-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightbox(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black/60 text-base font-black text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Contacter via le site */}
        <div className="border-t-2 border-[#1a1a1a]/10 pt-4">
          <button
            className="bd-btn flex w-full items-center justify-center gap-2"
            style={{ background: "#6bcb77", color: "#1a1a2e", boxShadow: "3px 3px 0 #1a1a1a" }}
            onClick={() => alert("Messagerie en cours de développement")}
          >
            💬 Contacter {besoin.prenom} →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Composant principal
   ============================================================ */
export default function MatchingBesoins({ besoins }: { besoins: BesoinItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = besoins.find((b) => b.id === selectedId) ?? null;

  if (besoins.length === 0) {
    return (
      <div className="bd-bubble py-12 text-center">
        <p className="mb-3 text-4xl">🔍</p>
        <p className="font-bold text-[#1a1a2e]/60">
          Aucune demande pour l&apos;instant dans votre zone.
        </p>
        <p className="mt-1 text-sm text-[#1a1a2e]/40">
          Revenez régulièrement, de nouvelles demandes arrivent chaque jour.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-3 text-xs font-bold tracking-widest text-[#1a1a2e]/50 uppercase">
        {besoins.length} demande{besoins.length > 1 ? "s" : ""} pour vous
      </p>

      {/* Bouton retour mobile quand panel ouvert */}
      {selected && (
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 flex items-center gap-1 text-sm font-bold text-[#1a1a2e]/60 hover:text-[#1a1a2e] sm:hidden"
        >
          ← Retour aux demandes
        </button>
      )}

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
            {besoins.map((besoin, i) => {
              const emoji = METIER_EMOJIS[besoin.metierSlug] ?? "🔧";
              const isSelected = besoin.id === selectedId;
              const date = new Date(besoin.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              });

              return (
                <button
                  key={besoin.id}
                  onClick={() => setSelectedId(besoin.id)}
                  className="search-result-enter bd-card w-full cursor-pointer text-left"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    ...(isSelected
                      ? {
                          borderColor: "#6bcb77",
                          boxShadow: "4px 4px 0 #6bcb77",
                          background: "#f0fff4",
                        }
                      : {}),
                  }}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="shrink-0 text-2xl">{emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm leading-tight font-black text-[#1a1a2e]">
                        {besoin.prenom} — {besoin.metierLabel}
                      </p>
                      <p className="truncate text-xs font-semibold text-gray-500">
                        📍 {besoin.commune}
                      </p>
                      {!selected && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                          {besoin.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400">{date}</p>
                      {!selected && <p className="text-xs font-bold text-[#1a1a2e]/30">→</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- PANNEAU DÉTAIL ---- Mobile : plein écran */}
        {selected && (
          <div className="w-full sm:hidden">
            <BesoinPanel besoin={selected} onClose={() => setSelectedId(null)} />
          </div>
        )}

        {/* ---- PANNEAU DÉTAIL ---- Desktop : animation width */}
        <div
          className="hidden shrink-0 overflow-hidden sm:block"
          style={{
            width: selected ? "62%" : "0%",
            paddingLeft: selected ? "1rem" : "0",
            transition:
              "width 0.35s cubic-bezier(0.22, 1, 0.36, 1), padding-left 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {selected && <BesoinPanel besoin={selected} onClose={() => setSelectedId(null)} />}
        </div>
      </div>
    </div>
  );
}
