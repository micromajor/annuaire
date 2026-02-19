"use client";

import { useRef, useState, useTransition } from "react";

const MAX_TOTAL = 6;

interface Props {
  initialPhotos: string[];
}

export default function PortfolioUploader({ initialPhotos }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList) {
    setError(null);
    const available = MAX_TOTAL - photos.length;
    if (available <= 0) {
      setError(`Maximum ${MAX_TOTAL} photos atteint.`);
      return;
    }
    const selected = Array.from(files).slice(0, available);
    const fd = new FormData();
    selected.forEach((f) => fd.append("files", f));

    startTransition(async () => {
      const res = await fetch("/api/portfolio", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur upload");
      } else {
        setPhotos(data.urls as string[]);
      }
    });
  }

  async function handleDelete(url: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur suppression");
      } else {
        setPhotos(data.urls as string[]);
      }
    });
  }

  return (
    <div
      className="col-span-full rounded-2xl border-4 border-[#1a1a1a] bg-white p-6"
      style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="bd-titre text-xl text-[#1a1a2e]">&#128247; Photos de chantier</h2>
        <span className="text-sm font-semibold text-gray-400">
          {photos.length}&thinsp;/&thinsp;{MAX_TOTAL}
        </span>
      </div>

      {/* Grille photos existantes */}
      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border-2 border-[#1a1a1a]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleDelete(url)}
                disabled={isPending}
                aria-label="Supprimer"
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span
                  className="rounded-full bg-[#ff6b6b] px-2 py-0.5 text-xs font-black text-white"
                  style={{ border: "2px solid #fff" }}
                >
                  ✕ Supprimer
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'ajout */}
      {photos.length < MAX_TOTAL && (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1a1a2e]/30 bg-[#fafafa] px-4 py-6 text-center transition-colors hover:border-[#1a1a2e] hover:bg-[#fff8f0] ${isPending ? "pointer-events-none opacity-50" : ""}`}
        >
          <span className="text-2xl">&#128444;</span>
          <span className="text-sm font-bold text-[#1a1a2e]">Ajouter des photos</span>
          <span className="text-xs text-gray-400">
            JPG, PNG, WEBP &bull; max 5&thinsp;Mo par photo &bull; {MAX_TOTAL - photos.length}{" "}
            emplacement{MAX_TOTAL - photos.length > 1 ? "s" : ""} restant
            {MAX_TOTAL - photos.length > 1 ? "s" : ""}
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </label>
      )}

      {isPending && (
        <p className="mt-3 text-center text-sm font-semibold text-[#1a1a2e]/60">
          &#9696; Chargement&hellip;
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-[#ff6b6b]/10 px-3 py-2 text-sm font-semibold text-[#ff6b6b]">
          {error}
        </p>
      )}
    </div>
  );
}
