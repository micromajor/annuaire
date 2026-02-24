"use client";

import { useState } from "react";
import Image from "next/image";

export default function ShareFicheButton({
  artisanId,
  nomAffiche,
}: {
  artisanId: string;
  nomAffiche: string;
}) {
  const [copied, setCopied] = useState(false);
  const [carteVisible, setCarteVisible] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr";
  const url = `${appUrl}/artisan/${artisanId}`;
  const text = `Découvrez la fiche de ${nomAffiche} sur Oyez Artisans !`;
  const carteSrc = `/api/artisan/${artisanId}/carte`;
  const carteDownloadSrc = `/api/artisan/${artisanId}/carte?dl=1`;

  function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: nomAffiche, text, url }).catch(() => null);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  return (
    <div className="mt-3 space-y-3">
      {/* ── Partager le lien ── */}
      <div className="flex flex-wrap gap-2">
        {/* Partage natif (mobile) */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] px-3 py-1.5 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-[#f5c800]"
          >
            📤 Partager
          </button>
        )}

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#25D366] bg-[#25D366] px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#1ebe5d]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {/* Copier le lien */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1a1a1a] bg-white px-3 py-1.5 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-gray-50"
        >
          {copied ? "✅ Lien copié !" : "🔗 Copier le lien"}
        </button>
      </div>

      {/* ── Carte de visite ── */}
      <div>
        <button
          type="button"
          onClick={() => setCarteVisible((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#a78bfa] bg-[#f5f0ff] px-3 py-1.5 text-sm font-bold text-[#7c3aed] transition-colors hover:bg-[#ede9fe]"
        >
          📇 {carteVisible ? "Masquer la carte de visite" : "Ma carte de visite"}
        </button>

        {carteVisible && (
          <div className="mt-3 space-y-3">
            {/* Aperçu de la carte */}
            <div
              className="overflow-hidden rounded-xl border-4 border-[#1a1a1a]"
              style={{ boxShadow: "6px 6px 0 #1a1a1a", maxWidth: 560 }}
            >
              <Image
                src={carteSrc}
                alt={`Carte de visite de ${nomAffiche}`}
                width={1050}
                height={600}
                className="block w-full"
                unoptimized
              />
            </div>

            {/* Actions carte */}
            <div className="flex flex-wrap gap-2">
              <a
                href={carteDownloadSrc}
                download
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] px-3 py-1.5 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-[#f5c800]"
              >
                ⬇️ Télécharger en PNG
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#25D366] bg-[#25D366] px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#1ebe5d]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Partager sur WhatsApp
              </a>
            </div>
            <p className="text-xs text-gray-400">
              Télécharge l&apos;image et envoie-la dans tes conversations, groupes ou réseaux sociaux.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
