"use client";

import { useState } from "react";

interface Props {
  artisanId: string;
}

export default function SocialPreviewButton({ artisanId }: Props) {
  const [open, setOpen] = useState(false);
  const ogUrl = `/artisan/${artisanId}/opengraph-image`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-[#1a1a2e] hover:bg-[#ffe566]"
        style={{
          background: "#ffd93d",
          border: "3px solid #1a1a1a",
          boxShadow: "2px 2px 0 #1a1a1a",
        }}
      >
        <span>🖼️</span> Aperçu partage réseaux sociaux
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6"
            style={{ border: "4px solid #1a1a1a", boxShadow: "6px 6px 0 #1a1a1a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="bd-titre text-xl text-[#1a1a2e]">Aperçu de la carte de partage</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1 text-sm font-bold hover:bg-gray-100"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Simulation card réseaux sociaux */}
            <div className="overflow-hidden rounded-xl" style={{ border: "2px solid #ddd" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ogUrl}
                alt="Aperçu carte de partage"
                className="w-full"
                style={{ aspectRatio: "1200/630", objectFit: "cover" }}
              />
              <div className="bg-[#f0f2f5] px-4 py-3">
                <p className="text-xs tracking-wide text-gray-500 uppercase">oyezartisans.fr</p>
                <p className="text-sm font-bold text-[#1c1e21]">
                  Votre fiche artisan — Oyez Artisans !
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              ℹ️ Cet aperçu correspond à la carte affichée lors d&apos;un partage sur Facebook,
              LinkedIn ou WhatsApp. Si votre logo a des marges transparentes importantes,
              recadrez-le serré pour qu&apos;il s&apos;affiche bien en grand.
            </p>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: "#1a1a2e", border: "3px solid #1a1a1a" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
