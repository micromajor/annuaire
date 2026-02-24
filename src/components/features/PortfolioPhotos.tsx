"use client";

import { useState, useEffect, useCallback } from "react";

interface PortfolioPhotosProps {
  photos: string[];
  artisanNom: string;
}

export default function PortfolioPhotos({ photos, artisanNom }: PortfolioPhotosProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const isOpen = lightboxIdx !== null;

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const next = useCallback(() => {
    setLightboxIdx((i) => (i === null ? 0 : (i + 1) % photos.length));
  }, [photos.length]);

  const close = useCallback(() => setLightboxIdx(null), []);

  // Scroll lock + navigation clavier
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, prev, next, close]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.slice(0, 6).map((url, i) => (
          <button
            key={url}
            onClick={() => setLightboxIdx(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border-2 border-[#1a1a1a] focus:outline-none"
            style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Chantier ${i + 1} - ${artisanNom}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <span className="scale-0 text-2xl text-white transition-transform group-hover:scale-100">
                &#128269;
              </span>
            </div>
            {i === 5 && photos.length > 6 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-lg font-black text-white">+{photos.length - 6}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox plein écran */}
      {isOpen && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black"
          onClick={close}
        >
          {/* Image */}
          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIdx]}
              alt={`Chantier ${lightboxIdx + 1} - ${artisanNom}`}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Fermer */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-black/60 text-lg font-bold text-white hover:bg-black"
            aria-label="Fermer"
          >
            &#10005;
          </button>

          {/* Compteur */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-sm font-bold text-white/80">
            {lightboxIdx + 1} / {photos.length}
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/60 text-2xl text-white hover:bg-black"
                aria-label="Photo précédente"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/60 text-2xl text-white hover:bg-black"
                aria-label="Photo suivante"
              >
                &#8250;
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
