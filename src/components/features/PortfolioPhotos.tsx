"use client";

import { useState, useEffect } from "react";

interface PortfolioPhotosProps {
  photos: string[];
  artisanNom: string;
}

export default function PortfolioPhotos({ photos, artisanNom }: PortfolioPhotosProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Bloquer le scroll du body quand la lightbox est ouverte
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (photos.length === 0) return null;

  function openAt(idx: number) {
    setLightboxIdx(idx);
    setLightbox(photos[idx]);
  }

  function prev() {
    const idx = (lightboxIdx - 1 + photos.length) % photos.length;
    setLightboxIdx(idx);
    setLightbox(photos[idx]);
  }

  function next() {
    const idx = (lightboxIdx + 1) % photos.length;
    setLightboxIdx(idx);
    setLightbox(photos[idx]);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.slice(0, 6).map((url, i) => (
          <button
            key={url}
            onClick={() => openAt(i)}
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

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex cursor-pointer items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt={`Chantier ${lightboxIdx + 1} - ${artisanNom}`}
              className="max-h-[80vh] max-w-full rounded-xl border-3 border-white object-contain"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-4 -right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black/60 text-sm font-bold text-white hover:bg-black"
            >
              &#10005;
            </button>
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute top-1/2 -left-12 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/60 text-white hover:bg-black"
                >
                  &#8249;
                </button>
                <button
                  onClick={next}
                  className="absolute top-1/2 -right-12 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/60 text-white hover:bg-black"
                >
                  &#8250;
                </button>
              </>
            )}
            <p className="mt-2 text-center text-xs font-semibold text-white/60">
              {lightboxIdx + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
