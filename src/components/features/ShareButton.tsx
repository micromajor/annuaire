"use client";

import { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export default function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Web Share API — natif sur mobile (Android, iOS, MacOS récent)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch {
        // Annulé par l'utilisateur ou non supporté → fallback clipboard
      }
    }

    // Fallback : copier le lien dans le presse-papier
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Dernier recours : prompt natif
      prompt("Copiez ce lien :", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title={copied ? "Lien copié !" : "Partager cette fiche"}
      aria-label={copied ? "Lien copié !" : "Partager cette fiche"}
      className="flex items-center gap-2 rounded-xl border-2 border-[#1a1a2e] bg-white px-4 py-2 text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#ffd93d] active:scale-95"
      style={{ boxShadow: "3px 3px 0 #1a1a2e" }}
    >
      {copied ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copié !
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Partager
        </>
      )}
    </button>
  );
}
